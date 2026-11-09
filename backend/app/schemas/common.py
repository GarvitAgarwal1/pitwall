"""Common schemas for PitWall API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    app: str = "PitWall"


class RootResponse(BaseModel):
    message: str = "Welcome to PitWall API"
    status: str = "online"


class ErrorResponse(BaseModel):
    detail: str
