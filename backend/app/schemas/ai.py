from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AiGenerateRequest(BaseModel):
    project_id: str = Field(..., description="Target project ID")
    prompt: str = Field(..., min_length=3, max_length=2000, description="Natural language prompt describing the API")

class AiExplanationSchema(BaseModel):
    why_method: str = Field(..., description="Developer explanation for HTTP method choice")
    why_auth: str = Field(..., description="Developer explanation for authentication requirement choice")
    request_details: str = Field(..., description="Explanation of request payload contents")
    response_details: str = Field(..., description="Explanation of response payload contents")

class AiApiDesignResponse(BaseModel):
    generation_id: Optional[str] = None
    name: str = Field(..., description="API title / name")
    method: str = Field(..., description="HTTP Method (GET, POST, PUT, PATCH, DELETE)")
    path: str = Field(..., description="Endpoint path (e.g. /api/v1/customers)")
    description: str = Field(..., description="Clear API description")
    authentication_required: bool = Field(True, description="Whether auth token is required")
    request_schema: Dict[str, Any] = Field(default_factory=dict, description="JSON object representing request schema")
    response_schema: Dict[str, Any] = Field(default_factory=dict, description="JSON object representing response schema")
    explanation: AiExplanationSchema

class AiGenerationHistoryResponse(BaseModel):
    id: str
    project_id: str
    prompt: str
    generated_design: Dict[str, Any]
    explanation: Dict[str, Any]
    provider: str
    model: str
    created_at: datetime

    class Config:
        from_attributes = True
