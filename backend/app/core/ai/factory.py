from app.core.config import settings
from app.core.ai.base import BaseAIProvider
from app.core.ai.mock_provider import MockAIProvider
from app.core.ai.gemini_provider import GeminiProvider
from app.core.ai.openai_provider import OpenAIProvider

def get_ai_provider() -> BaseAIProvider:
    """
    Factory function returning the configured AI Provider instance.
    Supports AI_PROVIDER=gemini, AI_PROVIDER=openai, or AI_PROVIDER=mock (default).
    """
    provider_name = (settings.AI_PROVIDER or "mock").lower().strip()

    if provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "mock":
        return MockAIProvider()

    # If provider_name is unknown but key is provided, attempt Gemini as default LLM provider
    if settings.AI_API_KEY:
        return GeminiProvider()

    return MockAIProvider()
