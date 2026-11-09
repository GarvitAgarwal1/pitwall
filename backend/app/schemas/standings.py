"""Pydantic v2 schemas for Standings, Races, Laps, Stints, Pit Stops, Positions, Gaps, Weather, and Qualifying."""

from typing import Any, List, Optional, Union
from pydantic import BaseModel, Field


# ==========================================
# 1. Driver & Constructor Championship Standings
# ==========================================

class DriverStandingItem(BaseModel):
    position: int
    points: float
    wins: int
    driver_id: str
    driver_number: Optional[int] = None
    driver_code: str
    given_name: str
    family_name: str
    nationality: str
    constructor_id: str
    constructor_name: str


class DriverStandingsResponse(BaseModel):
    season: str
    round: Optional[int] = None
    standings: List[DriverStandingItem]


class ConstructorStandingItem(BaseModel):
    position: int
    points: float
    wins: int
    constructor_id: str
    constructor_name: str
    nationality: str


class ConstructorStandingsResponse(BaseModel):
    season: str
    round: Optional[int] = None
    standings: List[ConstructorStandingItem]


# ==========================================
# 2. Race Schedule & Calendar
# ==========================================

class RaceScheduleItem(BaseModel):
    round: int
    race_name: str
    circuit_id: str
    circuit_name: str
    locality: str
    country: str
    date: str
    time: Optional[str] = None
    sprint_date: Optional[str] = None
    is_completed: bool = False


class RaceCalendarResponse(BaseModel):
    season: str
    races: List[RaceScheduleItem]


# ==========================================
# 3. Race Results
# ==========================================

class RaceResultItem(BaseModel):
    position: int
    driver_number: int
    driver_code: str
    driver_name: str
    constructor_name: str
    grid: int
    laps: int
    status: str
    points: float
    time_or_margin: Optional[str] = None
    fastest_lap_rank: Optional[int] = None
    fastest_lap_time: Optional[str] = None


class RaceResultsResponse(BaseModel):
    season: str
    round: int
    race_name: str
    circuit_name: str
    date: str
    results: List[RaceResultItem]


# ==========================================
# 4. Lap Timing & Mini-Sectors
# ==========================================

class LapItem(BaseModel):
    lap_number: int
    driver_number: int
    lap_duration: Optional[float] = None
    duration_sector_1: Optional[float] = None
    duration_sector_2: Optional[float] = None
    duration_sector_3: Optional[float] = None
    is_pit_out_lap: bool = False
    segments_sector_1: List[Optional[int]] = Field(default_factory=list)
    segments_sector_2: List[Optional[int]] = Field(default_factory=list)
    segments_sector_3: List[Optional[int]] = Field(default_factory=list)


class RaceLapsResponse(BaseModel):
    season: str
    round: int
    session_key: Optional[int] = None
    laps: List[LapItem]


# ==========================================
# 5. Stints & Tyres
# ==========================================

class StintItem(BaseModel):
    driver_number: int
    driver_name: Optional[str] = None
    stint_number: int
    lap_start: int
    lap_end: int
    compound: str
    tyre_age_at_start: int
    total_laps_on_tyre: int


class RaceStintsResponse(BaseModel):
    season: str
    round: int
    stints: List[StintItem]


# ==========================================
# 6. Pit Stops
# ==========================================

class PitStopItem(BaseModel):
    driver_number: Optional[int] = None
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    stop_number: int
    lap: int
    time_of_day: str
    duration: Optional[float] = None
    lane_duration: Optional[float] = None


class RacePitStopsResponse(BaseModel):
    season: str
    round: int
    pit_stops: List[PitStopItem]


# ==========================================
# 7. Positions
# ==========================================

class DriverLapPosition(BaseModel):
    lap_number: int
    driver_number: int
    position: int


class RacePositionsResponse(BaseModel):
    season: str
    round: int
    positions: List[DriverLapPosition]


# ==========================================
# 8. Gaps & Intervals
# ==========================================

class IntervalItem(BaseModel):
    lap_number: Optional[int] = None
    date: str
    driver_number: int
    gap_to_leader: Optional[float] = None
    interval: Optional[Union[float, str]] = None


class RaceGapsResponse(BaseModel):
    season: str
    round: int
    intervals: List[IntervalItem]


# ==========================================
# 9. Track Weather
# ==========================================

class WeatherItem(BaseModel):
    date: str
    air_temperature: float
    track_temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: int
    rainfall: int


class RaceWeatherResponse(BaseModel):
    season: str
    round: int
    weather_points: List[WeatherItem]


# ==========================================
# 10. Qualifying Results
# ==========================================

class QualifyingItem(BaseModel):
    position: int
    driver_number: int
    driver_code: str
    driver_name: str
    constructor_name: str
    q1: Optional[str] = None
    q2: Optional[str] = None
    q3: Optional[str] = None


class QualifyingResultsResponse(BaseModel):
    season: str
    round: int
    race_name: str
    circuit_name: str
    qualifying_results: List[QualifyingItem]
