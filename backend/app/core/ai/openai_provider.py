import httpx
import json
from typing import Dict, Any, List
from app.core.ai.base import BaseAIProvider
from app.core.ai.utils import clean_and_parse_json
from app.core.config import settings

class OpenAIProvider(BaseAIProvider):
    """
    OpenAI Provider integration using async httpx client.
    Configured via AI_API_KEY and AI_MODEL.
    """
    
    def __init__(self, api_key: str = "", model: str = ""):
        self.api_key = api_key or settings.AI_API_KEY
        self.model = model or settings.AI_MODEL or "gpt-4o-mini"

    async def _make_api_call(self, system_instruction: str, user_prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OpenAI API Key (AI_API_KEY) is required to use OpenAIProvider.")

        url = "https://api.openai.com/v1/chat/completions"
        
        request_body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=request_body, headers=headers)
                
                if response.status_code == 401:
                    raise RuntimeError("OpenAI API Authentication Error: Invalid or expired API Key.")
                elif response.status_code == 429:
                    raise RuntimeError("OpenAI API Quota Exceeded: Rate limit or quota limit reached.")
                elif response.status_code >= 400:
                    err_detail = ""
                    try:
                        err_detail = response.json().get("error", {}).get("message", response.text[:150])
                    except Exception:
                        err_detail = response.text[:150]
                    raise RuntimeError(f"OpenAI API Error ({response.status_code}): {err_detail}")

                data = response.json()
                
                choices = data.get("choices", [])
                if not choices:
                    raise RuntimeError("OpenAI API returned no choices in response.")

                raw_text = choices[0].get("message", {}).get("content", "")
                return clean_and_parse_json(raw_text)

        except httpx.TimeoutException:
            raise RuntimeError("OpenAI API Request Timed Out (30s limit exceeded).")
        except httpx.RequestError as e:
            raise RuntimeError(f"OpenAI Network Communication Failure: {str(e)}")
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError(f"OpenAI API processing error: {str(e)}")

    async def generate_api_design(self, prompt: str) -> Dict[str, Any]:
        system_instruction = (
            "You are an expert backend system architect. Generate a clean, structured REST API design in valid JSON format. "
            "Respond ONLY with a JSON object matching this schema:\n"
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
            "You are an expert backend system architect. Analyze system requirements and produce a structured architecture analysis in JSON format.\n"
            "Respond ONLY with a JSON object containing keys: architecture_style, summary, components (array of {id, name, type, description, technology, connections}), "
            "data_stores (array of {name, type, technology, purpose, rationale}), communication (array of {pattern, technology, use_case, rationale}), "
            "security (array of {category, recommendation, rationale}), scalability (array of {dimension, approach, rationale}), "
            "reliability (array of {pattern, approach, rationale}), bottlenecks (array of strings), recommendations (array of strings), and rationale."
        )
        return await self._make_api_call(system_instruction, prompt)

    async def generate_production_readiness_summary(
        self, score: int, status_str: str, categories: List[Dict[str, Any]], findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_instruction = (
            "You are a Principal Backend Reliability Engineer. Analyze the provided backend audit metrics, category scores, and findings. "
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
