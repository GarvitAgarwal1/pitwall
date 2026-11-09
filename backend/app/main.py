"""PitWall FastAPI Application Main Entrypoint.

Formula 1 Strategy & Telemetry Dashboard backend exposing 24 REST API endpoints,
live telemetry simulation, historical Jolpica records, and race strategy algorithms.
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.jolpica import jolpica_client
from app.clients.openf1 import openf1_client
from app.clients.rss import rss_client
from app.config import settings
from app.database import init_db
from app.routers import (
    circuits_router,
    drivers_router,
    live_router,
    news_router,
    races_router,
    standings_router,
    stats_router,
    strategy_router,
    telemetry_router,
)
from app.schemas.common import HealthResponse, RootResponse

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager: initialize database on startup and cleanly close clients."""
    # Startup
    logger.info("Starting PitWall API service...")
    try:
        await init_db()
    except Exception as exc:
        logger.warning(f"Database startup warning: {exc}")

    yield

    # Shutdown
    logger.info("Shutting down PitWall API service...")
    try:
        await openf1_client.close()
    except Exception:
        pass
    try:
        await jolpica_client.close()
    except Exception:
        pass
    try:
        await rss_client.close()
    except Exception:
        pass


app = FastAPI(
    title="PitWall API",
    version="1.0.0",
    description="Formula 1 Strategy & Telemetry Dashboard REST API",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root and Health Check Endpoints
@app.get("/", response_model=RootResponse, tags=["system"])
async def root() -> RootResponse:
    """Service root welcome endpoint."""
    return RootResponse(message="Welcome to PitWall API", status="online")


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    """Service health check endpoint."""
    return HealthResponse(status="ok", app="PitWall")


# Register all routers with /api prefix
app.include_router(standings_router, prefix="/api")
app.include_router(races_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(strategy_router, prefix="/api")
app.include_router(live_router, prefix="/api")
app.include_router(circuits_router, prefix="/api")
app.include_router(news_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
