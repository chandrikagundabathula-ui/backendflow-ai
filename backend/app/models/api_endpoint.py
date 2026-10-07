import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class ApiEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    method = Column(String(10), nullable=False, default="GET")  # GET, POST, PUT, PATCH, DELETE
    path = Column(String(255), nullable=False, index=True)
    
    # Schemas stored as JSON or string
    request_schema = Column(JSON, nullable=True)
    response_schema = Column(JSON, nullable=True)
    
    auth_required = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="active", nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", backref="api_endpoints")
