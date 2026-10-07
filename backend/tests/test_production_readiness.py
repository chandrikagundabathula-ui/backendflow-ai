import pytest
import asyncio
from app.core.ai import get_ai_provider

def get_auth_header(client, email="readiness_lead@backendflow.ai", password="PassWord123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "SRE Lead"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_project(client, headers, name="Production Readiness Lab"):
    res = client.post("/api/projects", json={"name": name, "description": "SRE Audit Workspace"}, headers=headers)
    return res.json()

def test_ai_provider_production_readiness_mock():
    provider = get_ai_provider()
    summary = asyncio.run(provider.generate_production_readiness_summary(
        score=88,
        status_str="READY",
        categories=[{"category": "security", "score": 90, "weight": 0.2, "status": "PASS", "findings_count": 0}],
        findings=[]
    ))
    assert "executive_summary" in summary
    assert "risk_level" in summary
    assert "top_priorities" in summary
    assert "verdict" in summary

def test_production_readiness_endpoint_unauthenticated(client):
    res = client.post("/api/projects/invalid-id/production-readiness/analyze")
    assert res.status_code == 401

def test_production_readiness_full_audit_lifecycle(client):
    headers = get_auth_header(client)
    project = create_test_project(client, headers)
    project_id = project["id"]

    # 1. Create registered API endpoints
    api_payload = {
        "name": "User Auth Login",
        "method": "POST",
        "path": "/api/v1/auth/login",
        "description": "User login token endpoint",
        "auth_required": True,
        "request_schema": {"email": "string", "password": "string"},
        "response_schema": {"access_token": "string", "token_type": "string"}
    }
    api_res = client.post(f"/api/projects/{project_id}/apis", json=api_payload, headers=headers)
    assert api_res.status_code == 201

    # 2. Trigger architecture analysis
    arch_payload = {
        "project_id": project_id,
        "prompt": "Design high availability e-commerce backend with Redis cache and PostgreSQL"
    }
    client.post("/api/ai/analyze-architecture", json=arch_payload, headers=headers)

    # 3. Trigger Production Readiness Audit Analysis
    audit_res = client.post(f"/api/projects/{project_id}/production-readiness/analyze", json={"include_ai_summary": True}, headers=headers)
    assert audit_res.status_code == 200
    report = audit_res.json()

    assert "report_id" in report and report["report_id"] is not None
    assert report["project_id"] == project_id
    assert 0 <= report["overall_score"] <= 100
    assert report["status"] in ["READY", "NEEDS ATTENTION", "NOT READY"]
    assert len(report["categories"]) == 8
    assert len(report["recommendations"]) > 0
    assert report["ai_summary"] is not None
    assert "executive_summary" in report["ai_summary"]

    # 4. Fetch History
    hist_res = client.get(f"/api/projects/{project_id}/production-readiness/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["id"] == report["report_id"]
    assert history[0]["score"] == report["overall_score"]
