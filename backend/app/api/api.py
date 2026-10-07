from fastapi import APIRouter
from app.api.endpoints import health, auth, projects, api_endpoints, ai, architecture, production_readiness

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(
    api_endpoints.router,
    prefix="/projects/{project_id}/apis",
    tags=["API Builder"],
)
api_router.include_router(
    ai.router,
    tags=["AI API Designer"],
)
api_router.include_router(
    architecture.router,
    tags=["Architecture Analyzer"],
)
api_router.include_router(
    production_readiness.router,
    tags=["Production Readiness Engine"],
)

