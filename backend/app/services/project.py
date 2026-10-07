from typing import List, Optional
import re
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

def generate_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

def get_projects(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
    return db.query(Project).filter(Project.owner_id == owner_id).offset(skip).limit(limit).all()

def get_project_by_id(db: Session, project_id: str, owner_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id, Project.owner_id == owner_id).first()

def create_project(db: Session, project_in: ProjectCreate, owner_id: int) -> Project:
    slug = project_in.slug or generate_slug(project_in.name)
    db_project = Project(
        name=project_in.name,
        slug=slug,
        description=project_in.description,
        environment=project_in.environment or "production",
        framework=project_in.framework or "FastAPI",
        services_count=project_in.services_count or 0,
        tables_count=project_in.tables_count or 0,
        status=project_in.status or "healthy",
        owner_id=owner_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_in: ProjectUpdate, owner_id: int) -> Optional[Project]:
    project = get_project_by_id(db, project_id, owner_id)
    if not project:
        return None

    update_data = project_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        update_data["slug"] = generate_slug(update_data["name"])

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project_id: str, owner_id: int) -> bool:
    project = get_project_by_id(db, project_id, owner_id)
    if not project:
        return False

    db.delete(project)
    db.commit()
    return True
