"""Pydantic v2 schemas for Driver Career, Driver Comparison, and All-Time Historical Statistics."""

from typing import List, Optional
from pydantic import BaseModel, Field


# ==========================================
# 1. Driver Career & Season Summaries
# ==========================================

class DriverSeasonSummary(BaseModel):
    year: int
    position: int
    points: float
    wins: int
    constructor: str


class DriverCareerResponse(BaseModel):
    driver_id: str
    driver_number: Optional[int] = None
    code: Optional[str] = None
    name: str
    nationality: str
    birth_date: str
    championships: int
    total_races: int
    wins: int
    podiums: int
    pole_positions: int
    fastest_laps: int
    career_points: float
    dnf_count: int
    teams: List[str]
    seasons: List[DriverSeasonSummary]


# ==========================================
# 2. Driver Comparison (Head-to-Head)
# ==========================================

class DriverHeadToHead(BaseModel):
    driver_id: str
    name: str
    code: str
    wins: int
    podiums: int
    poles: int
    points: float
    best_finish: int
    qualifying_ahead_count: int
    race_ahead_count: int
    dnfs: int


class DriversComparisonResponse(BaseModel):
    driver1: DriverHeadToHead
    driver2: DriverHeadToHead
    qualifying_winner: str
    race_finish_winner: str
    points_winner: str


# ==========================================
# 3. All-Time Historical Driver Stats
# ==========================================

class HistoricalDriverStats(BaseModel):
    driver_id: str
    driver_name: str
    nationality: str
    active_years: str
    world_championships: int
    race_entries: int
    race_wins: int
    podiums: int
    pole_positions: int
    fastest_laps: int
    dnf_count: int
    dns_count: int
    win_percentage: float
    podium_percentage: float


class DriverStatsResponse(BaseModel):
    total_drivers: int
    drivers: List[HistoricalDriverStats]


# ==========================================
# 4. All-Time Historical Constructor Stats
# ==========================================

class HistoricalConstructorStats(BaseModel):
    constructor_id: str
    constructor_name: str
    nationality: str
    active_years: str
    championships: int
    race_entries: int
    race_wins: int
    podiums: int
    pole_positions: int
    dnf_count: int
    dns_count: int
    win_percentage: float


class ConstructorStatsResponse(BaseModel):
    total_constructors: int
    constructors: List[HistoricalConstructorStats]
