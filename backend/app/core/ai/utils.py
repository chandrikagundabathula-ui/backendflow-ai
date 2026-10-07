import json
import re
from typing import Dict, Any

def clean_and_parse_json(text: str) -> Dict[str, Any]:
    """
    Cleans raw LLM text response and safely parses JSON.
    Handles markdown code blocks (```json ... ```), extra whitespace,
    and trailing/leading non-JSON characters.
    """
    if not text:
        raise ValueError("AI provider returned an empty response.")

    cleaned = text.strip()

    # Strip markdown fenced code blocks if present
    markdown_pattern = r"^```(?:json)?\s*([\s\S]*?)\s*```$"
    match = re.search(markdown_pattern, cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()

    # Try direct JSON parsing
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
        raise ValueError("Parsed JSON root must be an object (dict).")
    except json.JSONDecodeError:
        pass

    # Fallback: Extract first contiguous JSON object using regex
    json_object_match = re.search(r"(\{[\s\S]*\})", cleaned)
    if json_object_match:
        try:
            parsed = json.loads(json_object_match.group(1))
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Failed to parse valid JSON from AI response: {text[:200]}...")
