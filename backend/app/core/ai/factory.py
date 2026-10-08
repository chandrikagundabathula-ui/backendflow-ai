from app.core.config import settings
from app.core.ai.base import BaseAIProvider
from app.core.ai.mock_provider import MockAIProvider
from app.core.ai.gemini_provider import GeminiProvider
from app.core.ai.openai_provider import OpenAIProvider
from app.core.ai.nvidia_provider import NvidiaProvider

def get_ai_provider() -> BaseAIProvider:
    """
    Factory function returning the configured AI Provider instance.
    Supports AI_PROVIDER=nvidia, AI_PROVIDER=gemini, AI_PROVIDER=openai, or AI_PROVIDER=mock (default).
    When NVIDIA_API_KEY is configured, NvidiaProvider is selected unless AI_PROVIDER=mock is explicitly specified.
    """
    provider_name = (settings.AI_PROVIDER or "").lower().strip()

    if provider_name == "nvidia":
        return NvidiaProvider()
    elif provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "mock":
        return MockAIProvider()

    # Priority selection based on configured keys when provider_name is default or unset
    if settings.NVIDIA_API_KEY:
        return NvidiaProvider()
    elif settings.AI_API_KEY:
        return GeminiProvider()

    return MockAIProvider()
