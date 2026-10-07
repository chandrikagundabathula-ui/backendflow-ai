from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ArchitectureAnalysisRequest(BaseModel):
    project_id: str = Field(..., description="Target project ID")
    prompt: str = Field(..., min_length=3, max_length=3000, description="Natural language system architecture requirements")

class ArchitectureComponent(BaseModel):
    id: str = Field(..., description="Unique component ID, e.g. gateway, auth_svc, tx_db")
    name: str = Field(..., description="Component title")
    type: str = Field(..., description="Component type: api_gateway, auth, service, database, cache, message_broker, external")
    description: str = Field(..., description="Role and responsibilities")
    technology: str = Field(..., description="Recommended technology stack")
    connections: List[str] = Field(default_factory=list, description="List of target component IDs this node connects to")

class DataStoreRecommendation(BaseModel):
    name: str = Field(..., description="Data store title")
    type: str = Field(..., description="Storage classification (SQL, NoSQL, Cache, Vector DB)")
    technology: str = Field(..., description="Specific database engine")
    purpose: str = Field(..., description="Intended usage domain")
    rationale: str = Field(..., description="Architectural reasoning for selection")

class CommunicationStrategy(BaseModel):
    pattern: str = Field(..., description="Communication pattern (REST, gRPC, Event Streaming, Websocket)")
    technology: str = Field(..., description="Protocol or broker technology")
    use_case: str = Field(..., description="Specific service interaction scenario")
    rationale: str = Field(..., description="Architectural rationale")

class SecurityStrategy(BaseModel):
    category: str = Field(..., description="Security domain (Auth, Encryption, Rate Limiting, Network)")
    recommendation: str = Field(..., description="Specific security measure")
    rationale: str = Field(..., description="Threat mitigation rationale")

class ScalabilityStrategy(BaseModel):
    dimension: str = Field(..., description="Scaling vector (Horizontal Scaling, Caching, Read Replicas)")
    approach: str = Field(..., description="Technical implementation approach")
    rationale: str = Field(..., description="Capacity scaling rationale")

class ReliabilityStrategy(BaseModel):
    pattern: str = Field(..., description="Resilience pattern (Circuit Breakers, Idempotency, Connection Pooling)")
    approach: str = Field(..., description="Fault tolerance implementation")
    rationale: str = Field(..., description="Reliability rationale")

class ArchitectureAnalysisResponse(BaseModel):
    analysis_id: Optional[str] = None
    architecture_style: str = Field(..., description="Primary architectural pattern")
    summary: str = Field(..., description="High-level architecture executive summary")
    components: List[ArchitectureComponent] = Field(default_factory=list)
    data_stores: List[DataStoreRecommendation] = Field(default_factory=list)
    communication: List[CommunicationStrategy] = Field(default_factory=list)
    security: List[SecurityStrategy] = Field(default_factory=list)
    scalability: List[ScalabilityStrategy] = Field(default_factory=list)
    reliability: List[ReliabilityStrategy] = Field(default_factory=list)
    bottlenecks: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    rationale: str = Field(..., description="Overarching engineering trade-off rationale")

class ArchitectureHistoryResponse(BaseModel):
    id: str
    project_id: str
    prompt: str
    architecture_result: Dict[str, Any]
    provider: str
    model: str
    created_at: datetime

    class Config:
        from_attributes = True
