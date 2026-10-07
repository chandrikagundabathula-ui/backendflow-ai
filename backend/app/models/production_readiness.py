import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductionReadinessReport(Base):
    __tablename__ = "production_readiness_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)
    report_data = Column(JSON, nullable=False)
    ai_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", backref="production_readiness_reports")
