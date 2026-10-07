from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    environment: Optional[str] = "production"
    framework: Optional[str] = "FastAPI"
    services_count: Optional[int] = 0
    tables_count: Optional[int] = 0
    status: Optional[str] = "healthy"

class ProjectCreate(ProjectBase):
    slug: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    environment: Optional[str] = None
    framework: Optional[str] = None
    services_count: Optional[int] = None
    tables_count: Optional[int] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    slug: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
