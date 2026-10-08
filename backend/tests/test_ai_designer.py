import pytest
from app.core.ai import MockAIProvider, get_ai_provider
from app.services.ai_validator import validate_and_sanitize_ai_output
from fastapi import HTTPException

def get_auth_header(client, email="aidev@backendflow.ai", password="PassWord123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "AI Dev Lead"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_project(client, headers, name="AI Workspace"):
    res = client.post("/api/projects", json={"name": name, "description": "Workspace for AI design tests"}, headers=headers)
    return res.json()

def test_ai_provider_factory_and_mock(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.AI_PROVIDER", "mock")
    monkeypatch.setattr("app.core.config.settings.NVIDIA_API_KEY", "")
    provider = get_ai_provider()
    assert isinstance(provider, MockAIProvider)

import asyncio

def test_mock_provider_deterministic_intent():
    provider = MockAIProvider()
    design = asyncio.run(provider.generate_api_design("Create a customer API with name and email"))
    assert design["method"] == "POST"
    assert "customers" in design["path"]
    assert "explanation" in design

def test_ai_output_validator_sanitization():
    # Valid raw dict
    valid_raw = {
        "name": "Customer API",
        "method": "post",
        "path": "/api/v1/customers",
        "description": "Safe customer creation",
        "authentication_required": True,
        "request_schema": {"name": "string"},
        "response_schema": {"id": "uuid"},
        "explanation": {
            "why_method": "POST for creation",
            "why_auth": "Security",
            "request_details": "Name required",
            "response_details": "ID returned"
        }
    }
    validated = validate_and_sanitize_ai_output(valid_raw)
    assert validated.method == "POST"
    assert validated.path == "/api/v1/customers"

    # Invalid HTTP Method
    invalid_method = dict(valid_raw, method="INVALID_METHOD")
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_ai_output(invalid_method)
    assert exc_info.value.status_code == 422

    # Malicious script pattern
    malicious_raw = dict(valid_raw, name="<script>alert('hack')</script>")
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_ai_output(malicious_raw)
    assert exc_info.value.status_code == 422

def test_ai_generate_api_endpoint_lifecycle(client):
    headers = get_auth_header(client)
    project = create_test_project(client, headers)
    project_id = project["id"]

    # 1. Unauthenticated request -> 401
    unauth_res = client.post("/api/ai/generate-api", json={"project_id": project_id, "prompt": "Create an order API"})
    assert unauth_res.status_code == 401

    # 2. Authenticated AI API Generation
    gen_payload = {
        "project_id": project_id,
        "prompt": "Create an authenticated customer API that accepts name, email and phone number and returns customer details."
    }
    gen_res = client.post("/api/ai/generate-api", json=gen_payload, headers=headers)
    assert gen_res.status_code == 200
    ai_data = gen_res.json()
    assert ai_data["method"] in ["GET", "POST", "PUT", "PATCH", "DELETE"]
    assert ai_data["path"].startswith("/")
    assert "explanation" in ai_data
    assert "why_method" in ai_data["explanation"]
    assert "why_auth" in ai_data["explanation"]
    assert ai_data["generation_id"] is not None

    # 3. Retrieve AI Generation History
    hist_res = client.get(f"/api/projects/{project_id}/ai-generations", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["prompt"] == gen_payload["prompt"]

    # 4. Human Review -> Create API Persistence via API Builder
    create_api_payload = {
        "name": ai_data["name"],
        "method": ai_data["method"],
        "path": ai_data["path"],
        "description": ai_data["description"],
        "auth_required": ai_data["authentication_required"],
        "request_schema": ai_data["request_schema"],
        "response_schema": ai_data["response_schema"],
    }
    create_res = client.post(f"/api/projects/{project_id}/apis", json=create_api_payload, headers=headers)
    assert create_res.status_code == 201
    created_api = create_res.json()
    assert created_api["name"] == ai_data["name"]
    assert created_api["path"] == ai_data["path"]
