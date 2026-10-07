from typing import List
from sqlalchemy.orm import Session
from app.models.ai_generation import AiGeneration
from app.schemas.ai import AiApiDesignResponse

def save_ai_generation(
    db: Session,
    project_id: str,
    prompt: str,
    validated_design: AiApiDesignResponse,
    provider: str = "mock",
    model: str = "default",
) -> AiGeneration:
    """Persists an AI generation result to the database for historical audit."""
    design_dict = {
        "name": validated_design.name,
        "method": validated_design.method,
        "path": validated_design.path,
        "description": validated_design.description,
        "authentication_required": validated_design.authentication_required,
        "request_schema": validated_design.request_schema,
        "response_schema": validated_design.response_schema,
    }
    explanation_dict = validated_design.explanation.model_dump()

    db_obj = AiGeneration(
        project_id=project_id,
        prompt=prompt,
        generated_design=design_dict,
        explanation=explanation_dict,
        provider=provider,
        model=model,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_ai_generations_for_project(db: Session, project_id: str) -> List[AiGeneration]:
    """Retrieves all past AI generations for a given project ordered by newest first."""
    return (
        db.query(AiGeneration)
        .filter(AiGeneration.project_id == project_id)
        .order_by(AiGeneration.created_at.desc())
        .all()
    )
