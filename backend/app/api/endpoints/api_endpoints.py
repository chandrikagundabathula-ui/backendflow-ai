from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.api_endpoint import (
    ApiEndpointCreate,
    ApiEndpointUpdate,
    ApiEndpointResponse,
    ApiTestRequest,
    ApiTestResponse,
)
from app.models.user import User
from app.services.auth import get_current_user
from app.services.project import get_project_by_id
from app.services import api_endpoint as api_service

router = APIRouter()

def verify_project_ownership(db: Session, project_id: str, user_id: int):
    project = get_project_by_id(db, project_id=project_id, owner_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or user does not have access permission",
        )
    return project

@router.get("", response_model=List[ApiEndpointResponse])
def list_apis_for_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    apis = api_service.get_apis_for_project(db, project_id=project_id)
    return apis

@router.post("", response_model=ApiEndpointResponse, status_code=status.HTTP_201_CREATED)
def create_api_for_project(
    project_id: str,
    api_in: ApiEndpointCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    new_api = api_service.create_api(db, project_id=project_id, api_in=api_in)
    return new_api

@router.get("/{api_id}", response_model=ApiEndpointResponse)
def get_api_endpoint(
    project_id: str,
    api_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    api_obj = api_service.get_api_by_id(db, project_id=project_id, api_id=api_id)
    if not api_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Endpoint definition not found",
        )
    return api_obj

@router.put("/{api_id}", response_model=ApiEndpointResponse)
def update_api_endpoint(
    project_id: str,
    api_id: str,
    api_in: ApiEndpointUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    updated = api_service.update_api(db, project_id=project_id, api_id=api_id, api_in=api_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Endpoint definition not found",
        )
    return updated

@router.delete("/{api_id}", status_code=status.HTTP_200_OK)
def delete_api_endpoint(
    project_id: str,
    api_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    success = api_service.delete_api(db, project_id=project_id, api_id=api_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Endpoint definition not found",
        )
    return {"message": "API definition deleted successfully", "id": api_id}

@router.post("/{api_id}/test", response_model=ApiTestResponse)
def test_api_endpoint(
    project_id: str,
    api_id: str,
    test_in: ApiTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    verify_project_ownership(db, project_id, current_user.id)
    result = api_service.test_api_execution(db, project_id=project_id, api_id=api_id, test_in=test_in)
    return result
