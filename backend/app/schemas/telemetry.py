"""Pydantic v2 schemas for Single-Driver and Comparative Telemetry Traces."""

from typing import List, Optional
from pydantic import BaseModel, Field


class TelemetrySample(BaseModel):
    timestamp: str
    time_offset: float  # seconds elapsed from lap start
    distance_m: float   # cumulative distance along lap (meters)
    speed: int          # km/h
    rpm: int
    gear: int           # 0 to 8
    throttle: int       # 0 to 100%
    brake: int          # 0 or 100%
    drs: int            # 0 or 1 (normalized active/inactive)


class LapTelemetryResponse(BaseModel):
    session_key: int
    driver_number: int
    lap_number: int
    lap_duration: float
    samples_count: int
    telemetry: List[TelemetrySample]


class CompareSample(BaseModel):
    distance_m: float
    d1_speed: int
    d2_speed: int
    d1_throttle: int
    d2_throttle: int
    d1_brake: int
    d2_brake: int
    d1_gear: int
    d2_gear: int
    d1_drs: int
    d2_drs: int
    delta_time: float  # d1 lead/lag in seconds (+ = d1 ahead, - = d2 ahead)


class TelemetryCompareResponse(BaseModel):
    session_key: int
    lap_number: int
    driver1_number: int
    driver1_lap_time: float
    driver2_number: int
    driver2_lap_time: float
    trace: List[CompareSample]
