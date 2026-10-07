from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", status_code=200)
def get_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV,
    }
