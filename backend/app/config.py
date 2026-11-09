import os
import json
from typing import List, Union
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from .env if present
load_dotenv()


def _get_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if not raw:
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000"
        ]
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings(BaseModel):
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./pitwall.db")
    )
    REDIS_URL: str = Field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379/0")
    )
    OPENF1_BASE_URL: str = Field(
        default_factory=lambda: os.getenv("OPENF1_BASE_URL", "https://api.openf1.org/v1")
    )
    JOLPICA_BASE_URL: str = Field(
        default_factory=lambda: os.getenv("JOLPICA_BASE_URL", "https://api.jolpi.ca/ergast/f1")
    )
    CORS_ORIGINS: List[str] = Field(default_factory=_get_cors_origins)
    APP_NAME: str = Field(default="PitWall")
    DEBUG: bool = Field(default_factory=lambda: os.getenv("DEBUG", "False").lower() in ("true", "1"))


settings = Settings()


def get_settings() -> Settings:
    return settings
