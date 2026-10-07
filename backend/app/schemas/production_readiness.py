from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FindingSchema(BaseModel):
    id: str = Field(..., description="Unique finding ID")
    title: str = Field(..., description="Short finding header")
    category: str = Field(..., description="Evaluation category domain")
    severity: str = Field(..., description="Severity level: CRITICAL, HIGH, MEDIUM, LOW")
    description: str = Field(..., description="Detailed explanation of risk or non-compliance")
    recommendation: str = Field(..., description="Actionable fix or mitigation step")
    impact: str = Field(..., description="Operational or security impact if unaddressed")

class CategoryScoreSchema(BaseModel):
    category: str = Field(..., description="Category key identifier")
    name: str = Field(..., description="Human-readable category title")
    score: int = Field(..., ge=0, le=100, description="Category score out of 100")
    weight: float = Field(..., description="Category weighting factor")
    status: str = Field(..., description="Category state: PASS, WARNING, FAIL")
    findings_count: int = Field(0, description="Total findings identified within category")

class AISummarySchema(BaseModel):
    executive_summary: str = Field(..., description="High level AI evaluation overview")
    risk_level: str = Field(..., description="Inferred risk level: LOW, MEDIUM, HIGH, CRITICAL")
    top_priorities: List[str] = Field(default_factory=list, description="Top actionable remediation priorities")
    verdict: str = Field(..., description="Architectural launch verdict")

class ProductionReadinessRequest(BaseModel):
    include_ai_summary: bool = Field(True, description="Whether to include AI executive assessment summary")

class ProductionReadinessResponse(BaseModel):
    report_id: Optional[str] = None
    project_id: str = Field(..., description="Target project ID")
    overall_score: int = Field(..., ge=0, le=100, description="Overall system production readiness score")
    status: str = Field(..., description="Overall readiness status: READY, NEEDS ATTENTION, NOT READY")
    categories: List[CategoryScoreSchema] = Field(default_factory=list)
    findings: List[FindingSchema] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    ai_summary: Optional[AISummarySchema] = None
    created_at: Optional[datetime] = None

class ProductionReadinessHistoryResponse(BaseModel):
    id: str
    project_id: str
    score: int
    status: str
    report_data: Dict[str, Any]
    ai_summary: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
