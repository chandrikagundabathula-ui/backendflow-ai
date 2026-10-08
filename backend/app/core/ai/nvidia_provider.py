import httpx
import json
from typing import Dict, Any, List
from app.core.ai.base import BaseAIProvider
from app.core.ai.utils import clean_and_parse_json
from app.core.config import settings

class NvidiaProvider(BaseAIProvider):
    """
    NVIDIA Build AI Provider integration using async httpx client.
    Configured via NVIDIA_API_KEY, NVIDIA_BASE_URL, and NVIDIA_MODEL.
    Uses NVIDIA's OpenAI-compatible Chat Completions API.
    """

    def __init__(self, api_key: str = "", base_url: str = "", model: str = ""):
        self.api_key = api_key or settings.NVIDIA_API_KEY
        self.base_url = (base_url or settings.NVIDIA_BASE_URL or "https://integrate.api.nvidia.com/v1").rstrip("/")
        self.model = model or settings.NVIDIA_MODEL or "openai/gpt-oss-20b"

    async def _make_api_call(self, system_instruction: str, user_prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("NVIDIA API Key (NVIDIA_API_KEY) is required to use NvidiaProvider.")

        url = f"{self.base_url}/chat/completions"

        request_body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 4096
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(url, json=request_body, headers=headers)

                if response.status_code == 401:
                    raise RuntimeError("NVIDIA API Authentication Error: Invalid or expired NVIDIA_API_KEY.")
                elif response.status_code == 429:
                    raise RuntimeError("NVIDIA API Rate Limit Exceeded: Rate limit or quota limit reached.")
                elif response.status_code >= 400:
                    err_detail = ""
                    try:
                        err_detail = response.json().get("error", {}).get("message", response.text[:150])
                    except Exception:
                        err_detail = response.text[:150]
                    raise RuntimeError(f"NVIDIA API Error ({response.status_code}): {err_detail}")

                data = response.json()

                choices = data.get("choices", [])
                if not choices:
                    raise RuntimeError("NVIDIA API returned no choices in response payload.")

                raw_text = choices[0].get("message", {}).get("content", "")
                return clean_and_parse_json(raw_text)

        except httpx.TimeoutException:
            raise RuntimeError("NVIDIA API Request Timed Out (90s limit exceeded).")
        except httpx.RequestError as e:
            raise RuntimeError(f"NVIDIA Network Communication Failure: {str(e)}")
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError(f"NVIDIA API processing error: {str(e)}")

    async def generate_api_design(self, prompt: str) -> Dict[str, Any]:
        system_instruction = (
            "You are an expert backend system architect. Generate a clean, structured REST API design in valid JSON format.\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            '  "name": "API Title",\n'
            '  "method": "GET|POST|PUT|PATCH|DELETE",\n'
            '  "path": "/api/v1/...",\n'
            '  "description": "Clear description",\n'
            '  "authentication_required": true|false,\n'
            '  "request_schema": { "field": "type" },\n'
            '  "response_schema": { "field": "type" },\n'
            '  "explanation": {\n'
            '    "why_method": "...",\n'
            '    "why_auth": "...",\n'
            '    "request_details": "...",\n'
            '    "response_details": "..."\n'
            '  }\n'
            "}"
        )
        return await self._make_api_call(system_instruction, prompt)

    async def analyze_architecture(self, prompt: str) -> Dict[str, Any]:
        system_instruction = (
            "You are an expert backend system architect. Analyze system requirements and produce a structured architecture analysis in valid JSON format.\n"
            "Respond ONLY with a JSON object containing keys:\n"
            "- architecture_style (string)\n"
            "- summary (string)\n"
            "- components (array of objects: {id, name, type, description, technology, connections})\n"
            "- data_stores (array of objects: {name, type, technology, purpose, rationale})\n"
            "- communication (array of objects: {pattern, technology, use_case, rationale})\n"
            "- security (array of objects: {category, recommendation, rationale})\n"
            "- scalability (array of objects: {dimension, approach, rationale})\n"
            "- reliability (array of objects: {pattern, approach, rationale})\n"
            "- bottlenecks (array of strings)\n"
            "- recommendations (array of strings)\n"
            "- rationale (string)"
        )
        return await self._make_api_call(system_instruction, prompt)

    async def generate_production_readiness_summary(
        self, score: int, status_str: str, categories: List[Dict[str, Any]], findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_instruction = (
            "You are a Principal Backend Reliability Engineer. Analyze the provided backend audit metrics, category scores, and findings.\n"
            "Respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "executive_summary": "High level assessment summary",\n'
            '  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",\n'
            '  "top_priorities": ["priority item 1", "priority item 2"],\n'
            '  "verdict": "Clear architectural verdict and launch condition"\n'
            "}"
        )
        user_prompt = f"Production Readiness Assessment Score: {score}/100\nStatus: {status_str}\nCategories: {json.dumps(categories)}\nFindings: {json.dumps(findings)}"
        return await self._make_api_call(system_instruction, user_prompt)
