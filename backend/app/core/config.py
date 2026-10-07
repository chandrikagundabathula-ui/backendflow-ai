import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BackendFlow AI Engine"
    VERSION: str = "0.1.0"
    ENV: str = "development"
    API_V1_STR: str = "/api"

    SECRET_KEY: str = "dev_secret_key_backendflow_ai_fastapi_sqlalchemy_jwt_token_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    AI_PROVIDER: str = "mock"  # mock, gemini, openai
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.5-flash"

    DATABASE_URL: str = "sqlite:///./backendflow.db"

    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
