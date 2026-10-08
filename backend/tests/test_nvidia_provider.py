import pytest
import asyncio
from unittest.mock import patch, MagicMock

from app.core.config import settings
from app.core.ai.base import BaseAIProvider
from app.core.ai.nvidia_provider import NvidiaProvider
from app.core.ai.mock_provider import MockAIProvider
from app.core.ai.factory import get_ai_provider

def test_nvidia_provider_factory_selection(monkeypatch):
    # Explicit NVIDIA provider selection
    monkeypatch.setattr(settings, "AI_PROVIDER", "nvidia")
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "nvapi-test-key")
    assert isinstance(get_ai_provider(), NvidiaProvider)

    # Auto selection when NVIDIA_API_KEY present and AI_PROVIDER not mock
    monkeypatch.setattr(settings, "AI_PROVIDER", "")
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "nvapi-test-key")
    assert isinstance(get_ai_provider(), NvidiaProvider)

    # Fallback to Mock when AI_PROVIDER=mock explicitly set
    monkeypatch.setattr(settings, "AI_PROVIDER", "mock")
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "")
    assert isinstance(get_ai_provider(), MockAIProvider)

def test_nvidia_provider_missing_key_raises(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.NVIDIA_API_KEY", "")
    provider = NvidiaProvider(api_key="")
    with pytest.raises(ValueError) as exc_info:
        asyncio.run(provider.generate_api_design("Create a payments API"))
    assert "NVIDIA API Key" in str(exc_info.value)

def test_nvidia_provider_successful_mocked_response():
    provider = NvidiaProvider(api_key="nvapi-test-key", model="openai/gpt-oss-20b")
    
    mock_json = {
        "choices": [
            {
                "message": {
                    "content": '{\n  "architecture_style": "Event-Driven Microservices",\n  "summary": "NVIDIA Generated Architecture",\n  "components": [],\n  "data_stores": [],\n  "communication": [],\n  "security": [],\n  "scalability": [],\n  "reliability": [],\n  "bottlenecks": [],\n  "recommendations": [],\n  "rationale": "High throughput architecture"\n}'
                }
            }
        ]
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json

    async def run_test():
        with patch("httpx.AsyncClient.post", return_value=mock_response):
            return await provider.analyze_architecture("Build a payment gateway system")

    res = asyncio.run(run_test())
    assert res["architecture_style"] == "Event-Driven Microservices"
    assert res["summary"] == "NVIDIA Generated Architecture"

def test_nvidia_provider_401_error_handling():
    provider = NvidiaProvider(api_key="invalid_key")
    mock_response = MagicMock()
    mock_response.status_code = 401

    async def run_test():
        with patch("httpx.AsyncClient.post", return_value=mock_response):
            await provider.generate_api_design("Create a payment API")

    with pytest.raises(RuntimeError) as exc_info:
        asyncio.run(run_test())
    assert "NVIDIA API Authentication Error" in str(exc_info.value)
