from typing import List
from sqlalchemy.orm import Session
from app.models.architecture_analysis import ArchitectureAnalysis
from app.schemas.architecture import ArchitectureAnalysisResponse

def save_architecture_analysis(
    db: Session,
    project_id: str,
    prompt: str,
    validated: ArchitectureAnalysisResponse,
    provider: str = "mock",
    model: str = "default",
) -> ArchitectureAnalysis:
    """Persists an architecture analysis result to SQLite database."""
    res_dict = validated.model_dump(exclude={"analysis_id"})

    db_obj = ArchitectureAnalysis(
        project_id=project_id,
        prompt=prompt,
        architecture_result=res_dict,
        provider=provider,
        model=model,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_architecture_analyses_for_project(db: Session, project_id: str) -> List[ArchitectureAnalysis]:
    """Retrieves all past architecture analyses for a project ordered by newest first."""
    return (
        db.query(ArchitectureAnalysis)
        .filter(ArchitectureAnalysis.project_id == project_id)
        .order_by(ArchitectureAnalysis.created_at.desc())
        .all()
    )
