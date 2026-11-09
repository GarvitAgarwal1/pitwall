"""Pydantic v2 schemas for Live Timing, Race Control Alerts, and Safety Car Status."""

from typing import List, Optional
from pydantic import BaseModel, Field


class LiveDriverTiming(BaseModel):
    position: int
    driver_number: int
    driver_code: str
    driver_name: str
    team_name: str
    team_colour: str
    gap_to_leader: str   # 'LEADER', '+4.231', '+1 LAP'
    interval: str        # '-', '+1.120'
    last_lap_time: Optional[float] = None
    best_lap_time: Optional[float] = None
    sector_1: Optional[float] = None
    sector_2: Optional[float] = None
    sector_3: Optional[float] = None
    pit_stop_count: int
    tyre_compound: str
    tyre_age: int
    in_pit: bool


class LiveTimingResponse(BaseModel):
    session_key: int
    session_name: str
    current_lap: int
    total_laps: int
    status: str  # 'ACTIVE', 'SAFETY_CAR', 'VSC', 'RED_FLAG', 'FINISHED'
    drivers: List[LiveDriverTiming]


class RaceControlMessage(BaseModel):
    date: str
    lap_number: Optional[int] = None
    category: str
    flag: Optional[str] = None
    scope: Optional[str] = None
    message: str


class PenaltyItem(BaseModel):
    driver_number: int
    penalty_type: str
    reason: str


class LiveRaceControlResponse(BaseModel):
    session_key: int
    safety_car_status: str  # 'NONE', 'SAFETY_CAR', 'VIRTUAL_SAFETY_CAR', 'RED_FLAG'
    drs_status: str          # 'ENABLED', 'DISABLED'
    messages: List[RaceControlMessage]
    penalties: List[PenaltyItem]
