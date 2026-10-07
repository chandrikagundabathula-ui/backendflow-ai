import pytest
import asyncio
from fastapi import HTTPException
from app.core.ai import MockAIProvider, get_ai_provider
from app.services.architecture_validator import validate_and_sanitize_architecture_output

def get_auth_header(client, email="arch_lead@backendflow.ai", password="PassWord123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Chief Architect"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_project(client, headers, name="Cloud Architecture Lab"):
    res = client.post("/api/projects", json={"name": name, "description": "Architecture analysis workspace"}, headers=headers)
    return res.json()

def test_ai_provider_architecture_mock():
    provider = get_ai_provider()
    res = asyncio.run(provider.analyze_architecture("Design an e-commerce backend supporting 100k users"))
    assert "architecture_style" in res
    assert "components" in res
    assert "data_stores" in res
    assert "rationale" in res

def test_architecture_validator_security_sanitization():
    # Valid raw payload
    valid_raw = {
        "architecture_style": "Microservices",
        "summary": "High availability banking architecture",
        "components": [
            {"id": "gw", "name": "API Gateway", "type": "api_gateway", "description": "Proxy", "technology": "Envoy", "connections": ["svc1"]}
        ],
        "data_stores": [
            {"name": "Main DB", "type": "SQL", "technology": "PostgreSQL", "purpose": "Transactions", "rationale": "ACID compliance"}
        ],
        "communication": [],
        "security": [],
        "scalability": [],
        "reliability": [],
        "bottlenecks": ["DB Locks"],
        "recommendations": ["Read replicas"],
        "rationale": "High availability trade-off."
    }
    validated = validate_and_sanitize_architecture_output(valid_raw)
    assert validated.architecture_style == "Microservices"
    assert len(validated.components) == 1
    assert validated.components[0].id == "gw"

    # Security failure - malicious script tag
    malicious_raw = dict(valid_raw, summary="<script>alert('hack')</script>")
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_architecture_output(malicious_raw)
    assert exc_info.value.status_code == 422

def test_architecture_analysis_endpoint_lifecycle(client):
    headers = get_auth_header(client)
    project = create_test_project(client, headers)
    project_id = project["id"]

    # 1. Unauthenticated request -> 401
    unauth_res = client.post("/api/ai/analyze-architecture", json={"project_id": project_id, "prompt": "Design e-commerce system"})
    assert unauth_res.status_code == 401

    # 2. Authenticated Architecture Analysis Generation
    analyze_payload = {
        "project_id": project_id,
        "prompt": "I need an e-commerce backend supporting 100,000 users with authentication, products, orders, payments and notifications."
    }
    res = client.post("/api/ai/analyze-architecture", json=analyze_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["architecture_style"] is not None
    assert len(data["components"]) > 0
    assert len(data["data_stores"]) > 0
    assert len(data["communication"]) > 0
    assert len(data["security"]) > 0
    assert len(data["scalability"]) > 0
    assert len(data["reliability"]) > 0
    assert "rationale" in data
    assert data["analysis_id"] is not None

    # 3. Retrieve Architecture Analysis History
    hist_res = client.get(f"/api/projects/{project_id}/architecture-analyses", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["prompt"] == analyze_payload["prompt"]
