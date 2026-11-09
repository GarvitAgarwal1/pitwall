"""Live Timing & Race Control Router: Real-time timing tower, race control alerts, and safety car status."""

import logging
from typing import Optional
from fastapi import APIRouter, Path, Query

from app.schemas.live import (
    LiveRaceControlResponse,
    LiveTimingResponse,
)
from app.services.replay_engine import replay_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/timing/{session_key}", response_model=LiveTimingResponse)
async def get_live_timing(
    session_key: int = Path(..., description="Session key for active or replayed Grand Prix"),
    simulated_lap: Optional[int] = Query(None, description="Optional simulated lap for replay step"),
    timestamp: Optional[str] = Query(None, description="Optional ISO timestamp filter"),
) -> LiveTimingResponse:
    """
    Fetch near-real-time timing tower state (positions 1-20, gaps, intervals, lap times,
    sector splits, tyre compounds/age, and pit status) with 5-10s polling support.
    """
    data = await replay_engine.get_live_timing(session_key=session_key, simulated_lap=simulated_lap)
    return LiveTimingResponse(**data)


@router.get("/race-control/{session_key}", response_model=LiveRaceControlResponse)
async def get_live_race_control(
    session_key: int = Path(..., description="Session key for active or replayed Grand Prix"),
    simulated_lap: Optional[int] = Query(None, description="Optional simulated lap for replay step"),
) -> LiveRaceControlResponse:
    """
    Fetch real-time race control messages, flags, safety car / VSC status,
    DRS availability, and driver penalties.
    """
    data = await replay_engine.get_race_control(session_key=session_key, simulated_lap=simulated_lap)
    return LiveRaceControlResponse(**data)
