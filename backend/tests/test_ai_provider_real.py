import pytest
import asyncio
from unittest.mock import patch, MagicMock
from fastapi import HTTPException

from app.core.config import settings
from app.core.ai.base import BaseAIProvider
from app.core.ai.gemini_provider import GeminiProvider
from app.core.ai.openai_provider import OpenAIProvider
from app.core.ai.mock_provider import MockAIProvider
from app.core.ai.factory import get_ai_provider
from app.core.ai.utils import clean_and_parse_json

# --- 1. Clean & Safe JSON Parser Tests ---

def test_clean_and_parse_json_valid():
    raw_json = '{"name": "Order API", "method": "POST"}'
    res = clean_and_parse_json(raw_json)
    assert res["name"] == "Order API"
    assert res["method"] == "POST"

def test_clean_and_parse_json_markdown_fence():
    raw_markdown = '```json\n{\n  "architecture_style": "Microservices",\n  "summary": "High scale architecture"\n}\n```'
    res = clean_and_parse_json(raw_markdown)
    assert res["architecture_style"] == "Microservices"

def test_clean_and_parse_json_embedded_json():
    raw_text = 'Here is the analysis:\n{\n  "executive_summary": "System is production ready",\n  "risk_level": "LOW"\n}\nThank you!'
    res = clean_and_parse_json(raw_text)
    assert res["risk_level"] == "LOW"

def test_clean_and_parse_json_invalid_raises():
    with pytest.raises(ValueError):
        clean_and_parse_json("This is pure plain text with no JSON object")

def test_clean_and_parse_json_empty_raises():
    with pytest.raises(ValueError):
        clean_and_parse_json("")

# --- 2. AI Provider Factory Configuration & Selection Tests ---

def test_ai_provider_factory_selection(monkeypatch):
    # Mock
    monkeypatch.setattr(settings, "AI_PROVIDER", "mock")
    assert isinstance(get_ai_provider(), MockAIProvider)

    # Gemini
    monkeypatch.setattr(settings, "AI_PROVIDER", "gemini")
    assert isinstance(get_ai_provider(), GeminiProvider)

    # OpenAI
    monkeypatch.setattr(settings, "AI_PROVIDER", "openai")
    assert isinstance(get_ai_provider(), OpenAIProvider)

# --- 3. Provider Error Handling & Key Validation Tests ---

def test_gemini_provider_missing_key_raises():
    provider = GeminiProvider(api_key="")
    with pytest.raises(ValueError) as exc_info:
        asyncio.run(provider.generate_api_design("Create a payments API"))
    assert "Gemini API Key (AI_API_KEY) is required" in str(exc_info.value)

def test_openai_provider_missing_key_raises():
    provider = OpenAIProvider(api_key="")
    with pytest.raises(ValueError) as exc_info:
        asyncio.run(provider.generate_api_design("Create a payments API"))
    assert "OpenAI API Key (AI_API_KEY) is required" in str(exc_info.value)

# --- 4. Simulated Real AI Provider Responses & Failures ---

def test_gemini_provider_successful_mock_response():
    provider = GeminiProvider(api_key="test_api_key_12345")
    mock_json_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": '```json\n{\n  "name": "Live Payment Gateway API",\n  "method": "POST",\n  "path": "/api/v1/payments",\n  "description": "Processes credit card payments",\n  "authentication_required": true,\n  "request_schema": {"amount": "number"},\n  "response_schema": {"transaction_id": "string"},\n  "explanation": {\n    "why_method": "POST is required",\n    "why_auth": "Auth required",\n    "request_details": "Amount in cents",\n    "response_details": "Returns TX ID"\n  }\n}\n```'
                        }
                    ]
                }
            }
        ]
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json_response

    async def run_test():
        with patch("httpx.AsyncClient.post", return_value=mock_response):
            return await provider.generate_api_design("Create a payment API")

    result = asyncio.run(run_test())
    assert result["name"] == "Live Payment Gateway API"
    assert result["method"] == "POST"

def test_gemini_provider_401_error_handling():
    provider = GeminiProvider(api_key="invalid_key")
    mock_response = MagicMock()
    mock_response.status_code = 401

    async def run_test():
        with patch("httpx.AsyncClient.post", return_value=mock_response):
            await provider.generate_api_design("Create a payment API")

    with pytest.raises(RuntimeError) as exc_info:
        asyncio.run(run_test())
    assert "Gemini API Authentication Error" in str(exc_info.value)

def test_gemini_provider_429_quota_error_handling():
    provider = GeminiProvider(api_key="test_key")
    mock_response = MagicMock()
    mock_response.status_code = 429

    async def run_test():
        with patch("httpx.AsyncClient.post", return_value=mock_response):
            await provider.generate_api_design("Create a payment API")

    with pytest.raises(RuntimeError) as exc_info:
        asyncio.run(run_test())
    assert "Gemini API Quota Exceeded" in str(exc_info.value)

# --- 5. End-to-End API Integration & Auth Protection Tests ---

def get_auth_header(client, email="e2euser@backendflow.ai", password="SecurePassword123!"):
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "E2E Architect"})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_unauthenticated_api_protection(client):
    res = client.post("/api/projects", json={"name": "Protected Project"})
    assert res.status_code == 401

    res = client.post("/api/ai/generate-api", json={"project_id": "dummy", "prompt": "test"})
    assert res.status_code == 401

    res = client.post("/api/ai/analyze-architecture", json={"project_id": "dummy", "prompt": "test"})
    assert res.status_code == 401

def test_full_e2e_workflow(client):
    # 1. Register & Login
    headers = get_auth_header(client)
    
    # 2. Create Project
    proj_res = client.post("/api/projects", json={"name": "E2E Banking System", "description": "Core banking system"}, headers=headers)
    assert proj_res.status_code == 201
    project_id = proj_res.json()["id"]

    # 3. AI Architecture Analysis
    arch_res = client.post("/api/ai/analyze-architecture", json={"project_id": project_id, "prompt": "Design a banking ledger architecture"}, headers=headers)
    assert arch_res.status_code == 200
    arch_data = arch_res.json()
    assert "components" in arch_data
    assert len(arch_data["components"]) > 0

    # 4. AI API Generation
    api_res = client.post("/api/ai/generate-api", json={"project_id": project_id, "prompt": "Create an order checkout API"}, headers=headers)
    assert api_res.status_code == 200
    api_data = api_res.json()
    assert api_data["method"] in ["GET", "POST", "PUT", "PATCH", "DELETE"]

    # 5. Persist API Endpoint in API Builder
    create_api_res = client.post(
        f"/api/projects/{project_id}/apis",
        json={
            "name": api_data["name"],
            "method": api_data["method"],
            "path": api_data["path"],
            "description": api_data["description"],
            "auth_required": api_data["authentication_required"],
            "request_schema": api_data["request_schema"],
            "response_schema": api_data["response_schema"],
        },
        headers=headers,
    )
    assert create_api_res.status_code == 201
    created_api_id = create_api_res.json()["id"]

    # 6. Test API Endpoint Simulation
    test_res = client.post(
        f"/api/projects/{project_id}/apis/{created_api_id}/test",
        json={"payload": {"items": [{"id": 1, "qty": 2}]}},
        headers=headers,
    )
    assert test_res.status_code == 200
    assert test_res.json()["status_code"] in [200, 201]

    # 7. Production Readiness Audit
    readiness_res = client.post(
        f"/api/projects/{project_id}/production-readiness/analyze",
        json={"include_ai_summary": True},
        headers=headers,
    )
    assert readiness_res.status_code == 200
    readiness_data = readiness_res.json()
    assert readiness_data["overall_score"] >= 0
    assert len(readiness_data["categories"]) == 8
    assert readiness_data["ai_summary"] is not None

    # 8. Retrieve History Across Services
    ai_hist = client.get(f"/api/projects/{project_id}/ai-generations", headers=headers)
    assert ai_hist.status_code == 200
    assert len(ai_hist.json()) >= 1

    arch_hist = client.get(f"/api/projects/{project_id}/architecture-analyses", headers=headers)
    assert arch_hist.status_code == 200
    assert len(arch_hist.json()) >= 1

    readiness_hist = client.get(f"/api/projects/{project_id}/production-readiness/history", headers=headers)
    assert readiness_hist.status_code == 200
    assert len(readiness_hist.json()) >= 1
