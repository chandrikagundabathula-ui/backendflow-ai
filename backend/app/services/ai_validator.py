import re
from typing import Dict, Any
from fastapi import HTTPException, status
from app.schemas.ai import AiApiDesignResponse, AiExplanationSchema

ALLOWED_HTTP_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}
DANGEROUS_PATTERNS = [
    r"<script", r"javascript:", r"eval\(", r"exec\(", r"import\s+os",
    r"process\.env", r"__proto__", r"constructor", r"__import__"
]

def sanitize_string(text: str, field_name: str) -> str:
    """Checks string against dangerous code execution patterns."""
    if not isinstance(text, str):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Field '{field_name}' must be a string."
        )
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Security alert: Malicious code pattern detected in '{field_name}'."
            )
    return text.strip()

def sanitize_json_schema_dict(obj: Any, depth: int = 0) -> Dict[str, Any]:
    """Recursively validates that schema is a safe dictionary without executable code."""
    if depth > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="JSON schema exceeds maximum allowed nesting depth."
        )
    if not isinstance(obj, dict):
        if obj is None:
            return {}
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="JSON schema must be a dictionary object."
        )

    sanitized = {}
    for key, val in obj.items():
        clean_key = sanitize_string(str(key), "schema key")
        if isinstance(val, dict):
            sanitized[clean_key] = sanitize_json_schema_dict(val, depth + 1)
        elif isinstance(val, list):
            sanitized[clean_key] = [
                sanitize_json_schema_dict(item, depth + 1) if isinstance(item, dict)
                else sanitize_string(str(item), "schema array item")
                for item in val
            ]
        elif isinstance(val, (str, int, float, bool)):
            if isinstance(val, str):
                sanitized[clean_key] = sanitize_string(val, f"schema value for {clean_key}")
            else:
                sanitized[clean_key] = val
        elif val is None:
            sanitized[clean_key] = None
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported value type in JSON schema for key '{clean_key}'."
            )
    return sanitized

def validate_and_sanitize_ai_output(raw: Dict[str, Any]) -> AiApiDesignResponse:
    """
    Strictly validates raw output from AI Provider before returning or persisting.
    Treats raw AI output as UNTRUSTED input.
    """
    if not isinstance(raw, dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="AI output must be a valid JSON dictionary."
        )

    # Validate HTTP Method
    method = str(raw.get("method", "")).upper().strip()
    if method not in ALLOWED_HTTP_METHODS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported HTTP method '{method}'. Allowed methods: {', '.join(sorted(ALLOWED_HTTP_METHODS))}."
        )

    # Validate Endpoint Path
    path = str(raw.get("path", "")).strip()
    if not path.startswith("/"):
        path = "/" + path
    if not re.match(r"^/[a-zA-Z0-9_\-/{}]*$", path):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid endpoint path format '{path}'."
        )
    sanitize_string(path, "path")

    # Validate Title / Name
    name = sanitize_string(str(raw.get("name", "Generated API")), "name")
    if not name:
        name = "Generated API Definition"

    # Validate Description
    description = sanitize_string(str(raw.get("description", "")), "description")

    # Validate Authentication Required
    auth_req = raw.get("authentication_required", True)
    if isinstance(auth_req, str):
        auth_req = auth_req.lower() in ["true", "1", "yes"]
    else:
        auth_req = bool(auth_req)

    # Validate Schemas
    request_schema = sanitize_json_schema_dict(raw.get("request_schema", {}))
    response_schema = sanitize_json_schema_dict(raw.get("response_schema", {}))

    # Validate Explanation
    raw_exp = raw.get("explanation", {})
    if not isinstance(raw_exp, dict):
        raw_exp = {}

    explanation = AiExplanationSchema(
        why_method=sanitize_string(str(raw_exp.get("why_method", f"{method} method selected based on resource contract.")), "why_method"),
        why_auth=sanitize_string(str(raw_exp.get("why_auth", "Authentication enabled for security compliance.")), "why_auth"),
        request_details=sanitize_string(str(raw_exp.get("request_details", "Structured payload expected.")), "request_details"),
        response_details=sanitize_string(str(raw_exp.get("response_details", "Structured result returned.")), "response_details")
    )

    return AiApiDesignResponse(
        name=name,
        method=method,
        path=path,
        description=description,
        authentication_required=auth_req,
        request_schema=request_schema,
        response_schema=response_schema,
        explanation=explanation
    )
