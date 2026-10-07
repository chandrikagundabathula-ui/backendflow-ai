import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.api_endpoint import ApiEndpoint
from app.models.architecture_analysis import ArchitectureAnalysis
from app.models.production_readiness import ProductionReadinessReport
from app.schemas.production_readiness import (
    FindingSchema,
    CategoryScoreSchema,
    ProductionReadinessResponse,
)

def evaluate_production_readiness(db: Session, project: Project) -> ProductionReadinessResponse:
    endpoints = db.query(ApiEndpoint).filter(ApiEndpoint.project_id == project.id).all()
    architecture_records = db.query(ArchitectureAnalysis).filter(ArchitectureAnalysis.project_id == project.id).all()
    latest_arch = architecture_records[-1].architecture_result if architecture_records else None

    findings: List[FindingSchema] = []
    category_scores: List[CategoryScoreSchema] = []

    # -------------------------------------------------------------
    # 1. Security & Authentication (Weight: 0.20)
    # -------------------------------------------------------------
    sec_score = 100
    sec_findings = 0

    if not endpoints:
        sec_score -= 20
        findings.append(FindingSchema(
            id=f"SEC-{uuid.uuid4().hex[:6]}",
            title="No Auth Protected Endpoints Registered",
            category="security",
            severity="HIGH",
            description="Project currently has no registered API endpoints requiring authentication.",
            recommendation="Define authenticated endpoints with auth_required=True in API Builder.",
            impact="Exposes application resources to unauthenticated public access."
        ))
        sec_findings += 1
    else:
        unauth_mutation = [e for e in endpoints if not e.auth_required and e.method in ["POST", "PUT", "PATCH", "DELETE"]]
        if unauth_mutation:
            sec_score -= 30
            sec_findings += 1
            findings.append(FindingSchema(
                id=f"SEC-{uuid.uuid4().hex[:6]}",
                title=f"{len(unauth_mutation)} State-Mutating Endpoints Without Authentication",
                category="security",
                severity="CRITICAL" if len(unauth_mutation) > 2 else "HIGH",
                description=f"Endpoints like '{unauth_mutation[0].method} {unauth_mutation[0].path}' allow state mutation without authentication.",
                recommendation="Enforce auth_required=True on all POST, PUT, PATCH, and DELETE endpoints.",
                impact="Unauthenticated users can mutate or delete sensitive database records."
            ))
        
        missing_schemas = [e for e in endpoints if not e.request_schema and e.method in ["POST", "PUT", "PATCH"]]
        if missing_schemas:
            sec_score -= 15
            sec_findings += 1
            findings.append(FindingSchema(
                id=f"SEC-{uuid.uuid4().hex[:6]}",
                title="Missing Request Schema Input Validation",
                category="security",
                severity="MEDIUM",
                description=f"{len(missing_schemas)} endpoints lack explicit request JSON schema validation.",
                recommendation="Attach strict JSON request schemas to prevent payload injection.",
                impact="Increases vulnerability to malformed request payload injection attacks."
            ))

    if not latest_arch or not latest_arch.get("security"):
        sec_score -= 15
        sec_findings += 1
        findings.append(FindingSchema(
            id=f"SEC-{uuid.uuid4().hex[:6]}",
            title="Unspecified Microservice Security & CORS Boundary",
            category="security",
            severity="MEDIUM",
            description="No formal architecture security boundary assessment has been recorded.",
            recommendation="Run Architecture Analyzer to generate mTLS and OAuth2 boundary designs.",
            impact="Risk of missing network perimeter controls and rate-limiting policies."
        ))

    sec_score = max(0, min(100, sec_score))
    category_scores.append(CategoryScoreSchema(
        category="security",
        name="Security & Authentication",
        score=sec_score,
        weight=0.20,
        status="PASS" if sec_score >= 80 else ("WARNING" if sec_score >= 60 else "FAIL"),
        findings_count=sec_findings
    ))

    # -------------------------------------------------------------
    # 2. Reliability & Resilience (Weight: 0.15)
    # -------------------------------------------------------------
    rel_score = 100
    rel_findings = 0

    no_resp_schema = [e for e in endpoints if not e.response_schema]
    if no_resp_schema:
        rel_score -= 20
        rel_findings += 1
        findings.append(FindingSchema(
            id=f"REL-{uuid.uuid4().hex[:6]}",
            title=f"{len(no_resp_schema)} Endpoints Lacking Output Response Schemas",
            category="reliability",
            severity="MEDIUM",
            description="API responses without response schemas may emit unpredictable JSON payloads.",
            recommendation="Define structured JSON response schemas for all API endpoints.",
            impact="Downstream clients can crash due to unexpected schema modifications."
        ))

    if not latest_arch or not latest_arch.get("reliability"):
        rel_score -= 25
        rel_findings += 1
        findings.append(FindingSchema(
            id=f"REL-{uuid.uuid4().hex[:6]}",
            title="Missing Circuit Breaker & Retry Circuit Strategy",
            category="reliability",
            severity="HIGH",
            description="Architecture lacks explicit fault isolation, retry backoff, and circuit breaker patterns.",
            recommendation="Incorporate resilient retry and circuit breaker policies for external calls.",
            impact="Single service failures can trigger cascading system-wide outages."
        ))

    rel_score = max(0, min(100, rel_score))
    category_scores.append(CategoryScoreSchema(
        category="reliability",
        name="Reliability & Error Handling",
        score=rel_score,
        weight=0.15,
        status="PASS" if rel_score >= 80 else ("WARNING" if rel_score >= 60 else "FAIL"),
        findings_count=rel_findings
    ))

    # -------------------------------------------------------------
    # 3. Performance & Caching (Weight: 0.10)
    # -------------------------------------------------------------
    perf_score = 100
    perf_findings = 0

    get_endpoints = [e for e in endpoints if e.method == "GET"]
    unpaginated_gets = [e for e in get_endpoints if not e.request_schema or "page" not in str(e.request_schema).lower()]
    if unpaginated_gets:
        perf_score -= 25
        perf_findings += 1
        findings.append(FindingSchema(
            id=f"PERF-{uuid.uuid4().hex[:6]}",
            title="Unpaginated Collection Query Endpoints",
            category="performance",
            severity="MEDIUM",
            description=f"{len(unpaginated_gets)} GET collection endpoints lack explicit pagination or limit parameters.",
            recommendation="Add 'page' and 'limit' query parameter schema validation to GET list endpoints.",
            impact="Large database query results cause high memory consumption and latency spikes."
        ))

    if not latest_arch or not latest_arch.get("data_stores") or not any(ds.get("type", "").lower() in ["cache", "in-memory cache"] for ds in latest_arch.get("data_stores", [])):
        perf_score -= 20
        perf_findings += 1
        findings.append(FindingSchema(
            id=f"PERF-{uuid.uuid4().hex[:6]}",
            title="In-Memory Cache Layer Missing",
            category="performance",
            severity="LOW",
            description="No distributed cache (e.g., Redis Cluster) detected in architecture topology.",
            recommendation="Integrate a Redis cache layer for hot read queries and session storage.",
            impact="Primary database suffers high read load under heavy concurrent user spikes."
        ))

    perf_score = max(0, min(100, perf_score))
    category_scores.append(CategoryScoreSchema(
        category="performance",
        name="Performance & Latency",
        score=perf_score,
        weight=0.10,
        status="PASS" if perf_score >= 80 else ("WARNING" if perf_score >= 60 else "FAIL"),
        findings_count=perf_findings
    ))

    # -------------------------------------------------------------
    # 4. Scalability & Architecture (Weight: 0.15)
    # -------------------------------------------------------------
    scale_score = 100
    scale_findings = 0

    if not latest_arch:
        scale_score -= 35
        scale_findings += 1
        findings.append(FindingSchema(
            id=f"SCL-{uuid.uuid4().hex[:6]}",
            title="No Formal Architecture Blueprint Configured",
            category="scalability",
            severity="HIGH",
            description="Project has not performed an Architecture Analysis run.",
            recommendation="Use Architecture Analyzer to generate microservices and database sharding blueprints.",
            impact="Hinders horizontal scaling and capacity planning during high load."
        ))
    elif not latest_arch.get("scalability"):
        scale_score -= 20
        scale_findings += 1
        findings.append(FindingSchema(
            id=f"SCL-{uuid.uuid4().hex[:6]}",
            title="Horizontal Autoscaling Strategy Unspecified",
            category="scalability",
            severity="MEDIUM",
            description="Architecture blueprint lacks Kubernetes pod autoscaling or read replica sharding strategies.",
            recommendation="Define explicit horizontal autoscaling rules based on CPU/Memory metrics.",
            impact="Manual scaling bottleneck during unexpected traffic bursts."
        ))

    scale_score = max(0, min(100, scale_score))
    category_scores.append(CategoryScoreSchema(
        category="scalability",
        name="Scalability & Topology",
        score=scale_score,
        weight=0.15,
        status="PASS" if scale_score >= 80 else ("WARNING" if scale_score >= 60 else "FAIL"),
        findings_count=scale_findings
    ))

    # -------------------------------------------------------------
    # 5. Observability & Monitoring (Weight: 0.10)
    # -------------------------------------------------------------
    obs_score = 100
    obs_findings = 0

    obs_score -= 15
    obs_findings += 1
    findings.append(FindingSchema(
        id=f"OBS-{uuid.uuid4().hex[:6]}",
        title="Structured Distributed Tracing Unverified",
        category="observability",
        severity="LOW",
        description="OpenTelemetry / Jaeger trace propagation headers (x-trace-id) are not enforced across handlers.",
        recommendation="Inject trace correlation ID middleware into FastAPI request pipeline.",
        impact="Root-cause latency debugging across downstream services is delayed."
    ))

    obs_score = max(0, min(100, obs_score))
    category_scores.append(CategoryScoreSchema(
        category="observability",
        name="Observability & Metrics",
        score=obs_score,
        weight=0.10,
        status="PASS" if obs_score >= 80 else ("WARNING" if obs_score >= 60 else "FAIL"),
        findings_count=obs_findings
    ))

    # -------------------------------------------------------------
    # 6. API Quality & Standards (Weight: 0.10)
    # -------------------------------------------------------------
    api_score = 100
    api_findings = 0

    invalid_path_formats = [e for e in endpoints if not e.path.startswith("/api/")]
    if invalid_path_formats:
        api_score -= 20
        api_findings += 1
        findings.append(FindingSchema(
            id=f"API-{uuid.uuid4().hex[:6]}",
            title="Non-Standard Endpoint URI Routing",
            category="api_quality",
            severity="LOW",
            description=f"{len(invalid_path_formats)} endpoints do not follow standard '/api/v1/' URI namespace conventions.",
            recommendation="Prefix public API paths with '/api/v1/' for clear API gateway routing.",
            impact="Inconsistent API contract structure creates integration confusion."
        ))

    api_score = max(0, min(100, api_score))
    category_scores.append(CategoryScoreSchema(
        category="api_quality",
        name="API Quality & REST Design",
        score=api_score,
        weight=0.10,
        status="PASS" if api_score >= 80 else ("WARNING" if api_score >= 60 else "FAIL"),
        findings_count=api_findings
    ))

    # -------------------------------------------------------------
    # 7. Data & Database Integrity (Weight: 0.10)
    # -------------------------------------------------------------
    db_score = 100
    db_findings = 0

    if not latest_arch or not latest_arch.get("data_stores"):
        db_score -= 25
        db_findings += 1
        findings.append(FindingSchema(
            id=f"DB-{uuid.uuid4().hex[:6]}",
            title="Production Relational Database Store Unconfigured",
            category="data_database",
            severity="MEDIUM",
            description="Project currently uses SQLite or unverified database storage for persistent data.",
            recommendation="Configure PostgreSQL / CockroachDB with high availability replication in production.",
            impact="SQLite write locks hinder multi-pod concurrency in production environments."
        ))

    db_score = max(0, min(100, db_score))
    category_scores.append(CategoryScoreSchema(
        category="data_database",
        name="Data & Database Integrity",
        score=db_score,
        weight=0.10,
        status="PASS" if db_score >= 80 else ("WARNING" if db_score >= 60 else "FAIL"),
        findings_count=db_findings
    ))

    # -------------------------------------------------------------
    # 8. Deployment Readiness (Weight: 0.10)
    # -------------------------------------------------------------
    dep_score = 100
    dep_findings = 0

    dep_score -= 10
    dep_findings += 1
    findings.append(FindingSchema(
        id=f"DEP-{uuid.uuid4().hex[:6]}",
        title="CI/CD Automated Smoke Test Suite Unconfigured",
        category="deployment_readiness",
        severity="LOW",
        description="Continuous Integration deployment pipeline lacks automated smoke testing stages.",
        recommendation="Add pytest and Playwright E2E verification steps to GitHub Actions pipeline.",
        impact="Increases risk of introducing breaking changes during production release deployment."
    ))

    dep_score = max(0, min(100, dep_score))
    category_scores.append(CategoryScoreSchema(
        category="deployment_readiness",
        name="Deployment & Environment Readiness",
        score=dep_score,
        weight=0.10,
        status="PASS" if dep_score >= 80 else ("WARNING" if dep_score >= 60 else "FAIL"),
        findings_count=dep_findings
    ))

    # -------------------------------------------------------------
    # Overall Score & Status Calculation
    # -------------------------------------------------------------
    overall_score = int(round(sum(c.score * c.weight for c in category_scores)))
    overall_score = max(0, min(100, overall_score))

    critical_count = sum(1 for f in findings if f.severity == "CRITICAL")
    high_count = sum(1 for f in findings if f.severity == "HIGH")

    if overall_score >= 85 and critical_count == 0 and high_count == 0:
        overall_status = "READY"
    elif overall_score >= 65 and critical_count == 0:
        overall_status = "NEEDS ATTENTION"
    else:
        overall_status = "NOT READY"

    # Gather actionable top recommendations
    recs = [f.recommendation for f in findings if f.severity in ["CRITICAL", "HIGH"]]
    if len(recs) < 3:
        recs.extend([f.recommendation for f in findings if f.severity == "MEDIUM"])
    if not recs:
        recs = [
            "Maintain current continuous security audit compliance.",
            "Run automated regression test suites on every pull request."
        ]

    return ProductionReadinessResponse(
        project_id=project.id,
        overall_score=overall_score,
        status=overall_status,
        categories=category_scores,
        findings=findings,
        recommendations=recs[:6]
    )

def save_production_readiness_report(
    db: Session,
    project_id: str,
    score: int,
    status: str,
    report_data: Dict[str, Any],
    ai_summary: Optional[Dict[str, Any]] = None
) -> ProductionReadinessReport:
    report = ProductionReadinessReport(
        project_id=project_id,
        score=score,
        status=status,
        report_data=report_data,
        ai_summary=ai_summary,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_production_readiness_history(db: Session, project_id: str) -> List[ProductionReadinessReport]:
    return (
        db.query(ProductionReadinessReport)
        .filter(ProductionReadinessReport.project_id == project_id)
        .order_by(ProductionReadinessReport.created_at.desc())
        .all()
    )
