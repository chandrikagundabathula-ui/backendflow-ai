import re
from typing import Dict, Any, List
from fastapi import HTTPException, status
from app.schemas.architecture import (
    ArchitectureAnalysisResponse,
    ArchitectureComponent,
    DataStoreRecommendation,
    CommunicationStrategy,
    SecurityStrategy,
    ScalabilityStrategy,
    ReliabilityStrategy,
)

DANGEROUS_PATTERNS = [
    r"<script", r"javascript:", r"eval\(", r"exec\(", r"import\s+os",
    r"process\.env", r"__proto__", r"constructor", r"__import__"
]

def sanitize_str(val: Any, field_name: str) -> str:
    if not isinstance(val, str):
        val = str(val or "")
    text = val.strip()
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Security alert: Malicious code pattern detected in '{field_name}'."
            )
    return text

def validate_and_sanitize_architecture_output(raw: Dict[str, Any]) -> ArchitectureAnalysisResponse:
    if not isinstance(raw, dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Architecture AI response must be a valid JSON dictionary."
        )

    arch_style = sanitize_str(raw.get("architecture_style", "Microservices Architecture"), "architecture_style")
    summary = sanitize_str(raw.get("summary", "Structured system architecture analysis."), "summary")
    rationale = sanitize_str(raw.get("rationale", "Architectural trade-offs evaluated for scalability and security."), "rationale")

    # Validate Components
    raw_components = raw.get("components", [])
    if not isinstance(raw_components, list):
        raw_components = []
    
    components: List[ArchitectureComponent] = []
    valid_component_ids = set()

    for idx, comp in enumerate(raw_components):
        if not isinstance(comp, dict):
            continue
        c_id = sanitize_str(comp.get("id", f"node_{idx}"), "component id")
        valid_component_ids.add(c_id)

    for idx, comp in enumerate(raw_components):
        if not isinstance(comp, dict):
            continue
        c_id = sanitize_str(comp.get("id", f"node_{idx}"), "component id")
        c_name = sanitize_str(comp.get("name", f"Component {idx}"), "component name")
        c_type = sanitize_str(comp.get("type", "service"), "component type").lower()
        c_desc = sanitize_str(comp.get("description", ""), "component description")
        c_tech = sanitize_str(comp.get("technology", "General"), "component technology")
        
        raw_conns = comp.get("connections", [])
        if not isinstance(raw_conns, list):
            raw_conns = []
        conns = [sanitize_str(target, "connection target") for target in raw_conns if isinstance(target, str)]

        components.append(ArchitectureComponent(
            id=c_id,
            name=c_name,
            type=c_type,
            description=c_desc,
            technology=c_tech,
            connections=conns
        ))

    # Validate Data Stores
    raw_ds = raw.get("data_stores", [])
    data_stores = [
        DataStoreRecommendation(
            name=sanitize_str(item.get("name", "Database"), "data store name"),
            type=sanitize_str(item.get("type", "SQL"), "data store type"),
            technology=sanitize_str(item.get("technology", "PostgreSQL"), "data store tech"),
            purpose=sanitize_str(item.get("purpose", "Primary Store"), "data store purpose"),
            rationale=sanitize_str(item.get("rationale", "Strong ACID guarantees."), "data store rationale")
        )
        for item in raw_ds if isinstance(item, dict)
    ]

    # Validate Communication
    raw_comm = raw.get("communication", [])
    communication = [
        CommunicationStrategy(
            pattern=sanitize_str(item.get("pattern", "REST API"), "comm pattern"),
            technology=sanitize_str(item.get("technology", "HTTP/2"), "comm tech"),
            use_case=sanitize_str(item.get("use_case", "Synchronous RPC"), "comm use case"),
            rationale=sanitize_str(item.get("rationale", "Standard web protocol."), "comm rationale")
        )
        for item in raw_comm if isinstance(item, dict)
    ]

    # Validate Security
    raw_sec = raw.get("security", [])
    security = [
        SecurityStrategy(
            category=sanitize_str(item.get("category", "Authentication"), "security category"),
            recommendation=sanitize_str(item.get("recommendation", "OAuth2 JWT"), "security rec"),
            rationale=sanitize_str(item.get("rationale", "Stateless authentication."), "security rationale")
        )
        for item in raw_sec if isinstance(item, dict)
    ]

    # Validate Scalability
    raw_scale = raw.get("scalability", [])
    scalability = [
        ScalabilityStrategy(
            dimension=sanitize_str(item.get("dimension", "Horizontal Scaling"), "scalability dim"),
            approach=sanitize_str(item.get("approach", "Autoscaling pods"), "scalability approach"),
            rationale=sanitize_str(item.get("rationale", "Dynamic load absorption."), "scalability rationale")
        )
        for item in raw_scale if isinstance(item, dict)
    ]

    # Validate Reliability
    raw_rel = raw.get("reliability", [])
    reliability = [
        ReliabilityStrategy(
            pattern=sanitize_str(item.get("pattern", "Circuit Breakers"), "reliability pattern"),
            approach=sanitize_str(item.get("approach", "Envoy proxy"), "reliability approach"),
            rationale=sanitize_str(item.get("rationale", "Prevents cascading failures."), "reliability rationale")
        )
        for item in raw_rel if isinstance(item, dict)
    ]

    # Validate Bottlenecks & Recommendations
    raw_bottlenecks = raw.get("bottlenecks", [])
    bottlenecks = [sanitize_str(b, "bottleneck") for b in raw_bottlenecks if isinstance(b, str)]

    raw_recs = raw.get("recommendations", [])
    recommendations = [sanitize_str(r, "recommendation") for r in raw_recs if isinstance(r, str)]

    return ArchitectureAnalysisResponse(
        architecture_style=arch_style,
        summary=summary,
        components=components,
        data_stores=data_stores,
        communication=communication,
        security=security,
        scalability=scalability,
        reliability=reliability,
        bottlenecks=bottlenecks,
        recommendations=recommendations,
        rationale=rationale
    )
