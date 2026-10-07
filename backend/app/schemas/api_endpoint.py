from datetime import datetime
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, ConfigDict, field_validator

class ApiEndpointBase(BaseModel):
    name: str
    description: Optional[str] = None
    method: str = "GET"  # GET, POST, PUT, PATCH, DELETE
    path: str
    request_schema: Optional[Union[Dict[str, Any], str]] = None
    response_schema: Optional[Union[Dict[str, Any], str]] = None
    auth_required: Optional[bool] = True
    status: Optional[str] = "active"

    @field_validator("method")
    @classmethod
    def validate_method(cls, v: str) -> str:
        upper = v.upper()
        if upper not in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
            raise ValueError("Method must be one of GET, POST, PUT, PATCH, DELETE")
        return upper

class ApiEndpointCreate(ApiEndpointBase):
    pass

class ApiEndpointUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    method: Optional[str] = None
    path: Optional[str] = None
    request_schema: Optional[Union[Dict[str, Any], str]] = None
    response_schema: Optional[Union[Dict[str, Any], str]] = None
    auth_required: Optional[bool] = None
    status: Optional[str] = None

class ApiEndpointResponse(ApiEndpointBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApiTestRequest(BaseModel):
    payload: Optional[Dict[str, Any]] = None

class ApiTestResponse(BaseModel):
    status_code: int
    execution_time_ms: float
    request_sent: Dict[str, Any]
    response_body: Dict[str, Any]
    validation_status: str  # "valid" | "schema_error"
    message: str
