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

    # Remove markdown fence header if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    # 1. Direct JSON parsing
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    # 2. Extract complete JSON object bounded by { and }
    full_object_match = re.search(r"(\{[\s\S]*\})", cleaned)
    if full_object_match:
        extracted = full_object_match.group(1).strip()
        try:
            parsed = json.loads(extracted)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            fixed_commas = re.sub(r",\s*([\}\]])", r"\1", extracted)
            try:
                parsed = json.loads(fixed_commas)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                pass

    # 3. Truncated JSON object handling (starts with { but unclosed)
    truncated_match = re.search(r"(\{[\s\S]*)", cleaned)
    if truncated_match:
        extracted = truncated_match.group(1).strip()
        extracted = re.sub(r"```$", "", extracted).strip()

        open_braces = extracted.count("{") - extracted.count("}")
        open_brackets = extracted.count("[") - extracted.count("]")

        fixed = extracted
        if open_brackets > 0:
            fixed += "]" * open_brackets
        if open_braces > 0:
            fixed += "}" * open_braces

        try:
            parsed = json.loads(fixed)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            fixed_commas = re.sub(r",\s*([\}\]])", r"\1", fixed)
            try:
                parsed = json.loads(fixed_commas)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                pass

    raise ValueError(f"Failed to parse valid JSON from AI response: {text[:200]}...")
