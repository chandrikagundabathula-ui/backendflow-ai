from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIProvider(ABC):
    """
    Abstract Base Class for AI Providers.
    Reused across API Design, System Architecture Analysis, and Production Readiness capabilities.
    """
    
    @abstractmethod
    async def generate_api_design(self, prompt: str) -> Dict[str, Any]:
        """
        Accepts a natural language prompt and generates a structured API design.
        """
        pass

    @abstractmethod
    async def analyze_architecture(self, prompt: str) -> Dict[str, Any]:
        """
        Accepts backend system requirements and returns a structured architecture analysis.
        """
        pass

    @abstractmethod
    async def generate_production_readiness_summary(
        self, score: int, status_str: str, categories: List[Dict[str, Any]], findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Accepts production readiness evaluation results and generates executive AI analysis.
        """
        pass
