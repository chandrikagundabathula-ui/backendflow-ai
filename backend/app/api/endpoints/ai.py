from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.ai import get_ai_provider
from app.schemas.ai import (
    AiGenerateRequest,
    AiApiDesignResponse,
    AiGenerationHistoryResponse,
)
from app.models.user import User
from app.services.auth import get_current_user
from app.services.project import get_project_by_id
from app.services.ai_validator import validate_and_sanitize_ai_output
from app.services import ai as ai_service

router = APIRouter()

def verify_project_access(db: Session, project_id: str, user_id: int):
    project = get_project_by_id(db, project_id=project_id, owner_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or user does not have permission",
        )
    return project

@router.post("/ai/generate-api", response_model=AiApiDesignResponse)
async def generate_api_design(
    request_in: AiGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Generate a structured REST API design from natural language prompt.
    Validates output strictly before returning. Persists generation history.
    Does NOT directly mutate project API definitions.
    """
    verify_project_access(db, request_in.project_id, current_user.id)

    provider = get_ai_provider()
    try:
        raw_output = await provider.generate_api_design(request_in.prompt)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider error: {str(e)}",
        )

    validated = validate_and_sanitize_ai_output(raw_output)

    # Persist AI Generation audit record
    provider_name = getattr(provider, "__class__", type(provider)).__name__
    saved_record = ai_service.save_ai_generation(
        db=db,
        project_id=request_in.project_id,
        prompt=request_in.prompt,
        validated_design=validated,
        provider=provider_name,
        model=settings.AI_MODEL or "default",
    )

    validated.generation_id = saved_record.id
    return validated

@router.get("/projects/{project_id}/ai-generations", response_model=List[AiGenerationHistoryResponse])
def list_ai_generations_for_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieves past AI generations for a project.
    """
    verify_project_access(db, project_id, current_user.id)
    records = ai_service.get_ai_generations_for_project(db, project_id=project_id)
    return records
