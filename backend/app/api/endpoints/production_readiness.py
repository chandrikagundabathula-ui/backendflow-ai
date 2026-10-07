from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.ai import get_ai_provider
from app.schemas.production_readiness import (
    ProductionReadinessRequest,
    ProductionReadinessResponse,
    ProductionReadinessHistoryResponse,
    AISummarySchema,
)
from app.models.user import User
from app.services.auth import get_current_user
from app.services.project import get_project_by_id
from app.services import production_readiness as readiness_service

router = APIRouter()

def verify_project_access(db: Session, project_id: str, user_id: int):
    project = get_project_by_id(db, project_id=project_id, owner_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or user does not have permission",
        )
    return project

@router.post("/projects/{project_id}/production-readiness/analyze", response_model=ProductionReadinessResponse)
async def analyze_production_readiness(
    project_id: str,
    request_in: ProductionReadinessRequest = ProductionReadinessRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Perform a deterministic production readiness audit across 8 backend categories.
    Optionally calls AI provider to generate executive summary and actionable recommendations.
    Persists evaluation report in SQLite database.
    """
    project = verify_project_access(db, project_id, current_user.id)

    # 1. Deterministic Rule Engine Evaluation
    response = readiness_service.evaluate_production_readiness(db, project)

    # 2. Optional AI Executive Assessment
    ai_summary_dict = None
    if request_in.include_ai_summary:
        try:
            provider = get_ai_provider()
            categories_dict = [c.model_dump() for c in response.categories]
            findings_dict = [f.model_dump() for f in response.findings]
            raw_ai = await provider.generate_production_readiness_summary(
                score=response.overall_score,
                status_str=response.status,
                categories=categories_dict,
                findings=findings_dict,
            )
            ai_summary_obj = AISummarySchema(
                executive_summary=raw_ai.get("executive_summary", "AI evaluation completed."),
                risk_level=raw_ai.get("risk_level", "MEDIUM"),
                top_priorities=raw_ai.get("top_priorities", []),
                verdict=raw_ai.get("verdict", "Review findings prior to production deployment."),
            )
            response.ai_summary = ai_summary_obj
            ai_summary_dict = ai_summary_obj.model_dump()
        except Exception as e:
            # Fallback gracefully if AI provider is not available or fails
            print(f"[Production Readiness AI Warning] {e}")

    # 3. Persist Report in SQLite Database
    report_data_dict = {
        "overall_score": response.overall_score,
        "status": response.status,
        "categories": [c.model_dump() for c in response.categories],
        "findings": [f.model_dump() for f in response.findings],
        "recommendations": response.recommendations,
    }

    saved_report = readiness_service.save_production_readiness_report(
        db=db,
        project_id=project_id,
        score=response.overall_score,
        status=response.status,
        report_data=report_data_dict,
        ai_summary=ai_summary_dict,
    )

    response.report_id = saved_report.id
    response.created_at = saved_report.created_at
    return response

@router.get("/projects/{project_id}/production-readiness/history", response_model=List[ProductionReadinessHistoryResponse])
def get_production_readiness_history(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve historical production readiness analysis reports for a project.
    """
    verify_project_access(db, project_id, current_user.id)
    records = readiness_service.get_production_readiness_history(db, project_id=project_id)
    return records
