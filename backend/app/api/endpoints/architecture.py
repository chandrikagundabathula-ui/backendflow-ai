from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.ai import get_ai_provider
from app.schemas.architecture import (
    ArchitectureAnalysisRequest,
    ArchitectureAnalysisResponse,
    ArchitectureHistoryResponse,
)
from app.models.user import User
from app.services.auth import get_current_user
from app.services.project import get_project_by_id
from app.services.architecture_validator import validate_and_sanitize_architecture_output
from app.services import architecture as arch_service

router = APIRouter()

def verify_project_access(db: Session, project_id: str, user_id: int):
    project = get_project_by_id(db, project_id=project_id, owner_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or user does not have permission",
        )
    return project

@router.post("/ai/analyze-architecture", response_model=ArchitectureAnalysisResponse)
async def analyze_system_architecture(
    request_in: ArchitectureAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Analyze system requirements in natural language and generate structured architecture recommendations.
    Enforces security sanitization and Pydantic model validation. Persists result in SQLite.
    """
    verify_project_access(db, request_in.project_id, current_user.id)

    provider = get_ai_provider()
    try:
        raw_output = await provider.analyze_architecture(request_in.prompt)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider error: {str(e)}",
        )

    validated = validate_and_sanitize_architecture_output(raw_output)

    provider_name = getattr(provider, "__class__", type(provider)).__name__
    saved_record = arch_service.save_architecture_analysis(
        db=db,
        project_id=request_in.project_id,
        prompt=request_in.prompt,
        validated=validated,
        provider=provider_name,
        model=settings.AI_MODEL or "default",
    )

    validated.analysis_id = saved_record.id
    return validated

@router.get("/projects/{project_id}/architecture-analyses", response_model=List[ArchitectureHistoryResponse])
def list_architecture_analyses_for_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieves historical architecture analyses for a project workspace.
    """
    verify_project_access(db, project_id, current_user.id)
    records = arch_service.get_architecture_analyses_for_project(db, project_id=project_id)
    return records
