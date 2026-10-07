import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class AiGeneration(Base):
    __tablename__ = "ai_generations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    generated_design = Column(JSON, nullable=False)
    explanation = Column(JSON, nullable=False)
    provider = Column(String(50), nullable=False, default="mock")
    model = Column(String(100), nullable=False, default="default")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", backref="ai_generations")
