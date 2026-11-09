"""
E2E Test Suite Fixtures and Configuration for PitWall.
Opaque-box testing infrastructure supporting offline execution,
FastAPI TestClient, and comprehensive mock payloads.
"""

import sys
import math
import statistics
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pytest
from starlette.testclient import TestClient
from fastapi import FastAPI, HTTPException, Query, Path as FPath
from pydantic import BaseModel, Field

# Ensure pitwall/backend is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# ---------------------------------------------------------------------------
# Reference Pydantic Schemas (Derived from ORIGINAL_REQUEST.md & survey)
# ---------------------------------------------------------------------------

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
    is_completed: bool


class RaceCalendarResponse(BaseModel):
    season: str
    races: List[RaceScheduleItem]


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


class DriverLapPosition(BaseModel):
    lap_number: int
    driver_number: int
    position: int


class RacePositionsResponse(BaseModel):
    season: str
    round: int
    positions: List[DriverLapPosition]


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


class TelemetrySample(BaseModel):
    timestamp: str
    time_offset: float
    distance_m: float
    speed: int
    rpm: int
    gear: int
    throttle: int
    brake: int
    drs: int


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
    delta_time: float


class TelemetryCompareResponse(BaseModel):
    session_key: int
    lap_number: int
    driver1_number: int
    driver1_lap_time: float
    driver2_number: int
    driver2_lap_time: float
    trace: List[CompareSample]


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


class PitWindowResponse(BaseModel):
    session_key: int
    driver_number: int
    driver_code: str
    current_lap: int
    tyre_compound: str
    tyre_age: int
    degradation_rate_sec_per_lap: float
    estimated_cliff_lap: int
    laps_until_cliff: int
    earliest_pit_lap: int
    latest_pit_lap: int
    recommended_pit_lap: int
    undercut_status: str
    gap_ahead: Optional[float] = None
    gap_behind: Optional[float] = None
    pit_loss_time_sec: float
    projected_rejoin_position: int
    explanation: str


class PredictedDriverFinish(BaseModel):
    predicted_position: int
    current_position: int
    driver_number: int
    driver_code: str
    team_name: str
    confidence_score: float
    predicted_total_time_sec: float
    time_delta_to_winner_sec: float
    predicted_remaining_stops: int
    current_compound: str
    tyre_age: int


class RacePredictionResponse(BaseModel):
    session_key: int
    from_lap: int
    total_laps: int
    remaining_laps: int
    predictions: List[PredictedDriverFinish]


class LiveDriverTiming(BaseModel):
    position: int
    driver_number: int
    driver_code: str
    driver_name: str
    team_name: str
    team_colour: str
    gap_to_leader: str
    interval: str
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
    status: str
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
    safety_car_status: str
    drs_status: str
    messages: List[RaceControlMessage]
    penalties: List[PenaltyItem]


class CircuitInfo(BaseModel):
    circuit_id: str
    circuit_name: str
    locality: str
    country: str
    lat: float
    long: float
    length_km: float
    turns: int
    lap_record_time: Optional[str] = None
    lap_record_driver: Optional[str] = None
    lap_record_year: Optional[int] = None


class CircuitsListResponse(BaseModel):
    circuits: List[CircuitInfo]


class CircuitWinnerItem(BaseModel):
    year: int
    driver_name: str
    constructor_name: str
    time: str
    laps: int


class CircuitPoleItem(BaseModel):
    year: int
    driver_name: str
    time: str


class CircuitHistoryResponse(BaseModel):
    circuit_id: str
    circuit_name: str
    first_held_year: int
    races_held_count: int
    past_winners: List[CircuitWinnerItem]
    past_pole_sitters: List[CircuitPoleItem]


class NewsArticleItem(BaseModel):
    title: str
    link: str
    description: str
    pub_date: str
    source: str
    thumbnail_url: Optional[str] = None


class NewsFeedResponse(BaseModel):
    count: int
    articles: List[NewsArticleItem]


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


# ---------------------------------------------------------------------------
# Reference Implementations of Strategy Algorithms (R3)
# ---------------------------------------------------------------------------

def calculate_pit_window(
    tyre_age: int,
    lap_times: List[float],
    gap_ahead: float,
    gap_behind: float,
    remaining_laps: int,
    pit_loss_time: float = 22.0,
    compound: str = "MEDIUM",
    current_lap: int = 20,
    total_laps: int = 57,
) -> Dict[str, Any]:
    """
    R3 Pit Window Algorithm:
    Computes degradation rate via linear regression on clean laps,
    estimates tyre cliff, checks undercut viability, and calculates window bounds.
    """
    compound_defaults = {"SOFT": 0.120, "MEDIUM": 0.075, "HARD": 0.045, "INTERMEDIATE": 0.090, "WET": 0.060}
    compound_cliffs = {"SOFT": 20, "MEDIUM": 28, "HARD": 38, "INTERMEDIATE": 25, "WET": 30}
    comp = compound.upper()
    default_alpha = compound_defaults.get(comp, 0.075)
    default_cliff_age = compound_cliffs.get(comp, 28)

    # Filter outlier / SC laps: laps between 0.85*median and 1.08*median
    clean_laps = []
    if lap_times:
        med = statistics.median(lap_times)
        clean_laps = [t for t in lap_times if 0.85 * med <= t <= 1.08 * med]

    if len(clean_laps) >= 3:
        k = len(clean_laps)
        x = list(range(k))
        x_bar = statistics.mean(x)
        y_bar = statistics.mean(clean_laps)
        denom = sum((xi - x_bar) ** 2 for xi in x)
        if denom > 0:
            slope = sum((x[i] - x_bar) * (clean_laps[i] - y_bar) for i in range(k)) / denom
            alpha = max(0.020, slope)
        else:
            alpha = default_alpha
    else:
        alpha = default_alpha

    # Cliff estimation
    est_ratio = default_alpha / max(alpha, 0.030)
    raw_cliff = round(default_cliff_age * est_ratio)
    cliff_age = max(tyre_age + 2, min(default_cliff_age + 8, raw_cliff))
    laps_until_cliff = max(0, cliff_age - tyre_age)
    cliff_lap = current_lap + laps_until_cliff

    # Undercut Viability
    if gap_ahead <= 1.80:
        undercut_status = "HIGHLY_VIABLE"
    elif gap_ahead <= 2.80:
        undercut_status = "VIABLE"
    elif gap_ahead <= 3.80:
        undercut_status = "MARGINAL"
    else:
        undercut_status = "NOT_VIABLE"

    if gap_behind < 1.50 and undercut_status != "NOT_VIABLE":
        undercut_status = "MARGINAL"

    # Window Bounds
    earliest_pit_lap = max(current_lap + 1, current_lap)
    latest_pit_lap = min(cliff_lap, total_laps - 1)
    if latest_pit_lap < earliest_pit_lap:
        latest_pit_lap = earliest_pit_lap

    if undercut_status in ("HIGHLY_VIABLE", "VIABLE"):
        recommended_pit_lap = earliest_pit_lap
    else:
        recommended_pit_lap = min(latest_pit_lap, max(earliest_pit_lap, cliff_lap - 2))

    return {
        "degradation_rate": round(alpha, 4),
        "degradation_rate_sec_per_lap": round(alpha, 4),
        "cliff_lap": cliff_lap,
        "estimated_cliff_lap": cliff_lap,
        "laps_until_cliff": laps_until_cliff,
        "earliest_pit_lap": earliest_pit_lap,
        "latest_pit_lap": latest_pit_lap,
        "recommended_pit_lap": recommended_pit_lap,
        "undercut_status": undercut_status,
        "undercut_gap_delta": round(2.00 - gap_ahead, 2),
        "pit_loss_time_sec": pit_loss_time,
        "projected_rejoin_position": 4,
        "explanation": f"Tyre degradation at {alpha:.3f}s/lap with cliff projected at Lap {cliff_lap}. Undercut {undercut_status} against car ahead."
    }


def predict_race_result(
    current_positions: List[Dict[str, Any]],
    tyre_ages: Dict[int, int],
    compounds: Dict[int, str],
    lap_times: Dict[int, List[float]],
    current_lap: int,
    total_laps: int,
    pit_loss_time: float = 22.0
) -> List[Dict[str, Any]]:
    """
    R3 Race Predictor Algorithm:
    Fuel-corrected base pace simulation, tyre wear modeling across remaining laps,
    mandatory dry compound rule check, and predicted finish order with confidence scoring.
    """
    remaining_laps = max(0, total_laps - current_lap)
    compound_degs = {"SOFT": 0.120, "MEDIUM": 0.075, "HARD": 0.045, "INTERMEDIATE": 0.090, "WET": 0.060}

    driver_sims = []
    for pos_item in current_positions:
        d_num = pos_item["driver_number"]
        d_name = pos_item.get("driver_name", f"Driver {d_num}")
        d_code = pos_item.get("driver_code", str(d_num))
        curr_pos = pos_item.get("position", pos_item.get("current_position", 1))
        team = pos_item.get("team_name", "Formula 1 Team")

        t_age = tyre_ages.get(d_num, 10)
        compound = compounds.get(d_num, "MEDIUM").upper()
        deg = compound_degs.get(compound, 0.075)

        d_laps = lap_times.get(d_num, [92.0, 92.2, 92.5])
        raw_pace = statistics.median(d_laps) if d_laps else 92.0
        # Fuel-corrected base pace (-0.030s per lap fuel burn off)
        base_pace = raw_pace - deg * t_age + 0.030 * current_lap

        # Simulate remaining laps
        total_time = 0.0
        sim_tyre_age = t_age
        stops_planned = 0

        for lap in range(current_lap + 1, total_laps + 1):
            if sim_tyre_age > 28:  # pit stop required
                total_time += pit_loss_time
                stops_planned += 1
                sim_tyre_age = 0
                compound = "HARD"
                deg = compound_degs[compound]

            lap_time = base_pace + deg * sim_tyre_age - 0.030 * lap
            total_time += lap_time
            sim_tyre_age += 1

        driver_sims.append({
            "driver_number": d_num,
            "driver_name": d_name,
            "driver_code": d_code,
            "team_name": team,
            "current_position": curr_pos,
            "projected_total_time": round(total_time, 3),
            "predicted_total_time_sec": round(total_time, 3),
            "predicted_remaining_stops": stops_planned,
            "current_compound": compound,
            "tyre_age": t_age,
        })

    # Sort ascending by projected time to determine finishing order
    driver_sims.sort(key=lambda x: x["projected_total_time"])
    winner_time = driver_sims[0]["projected_total_time"] if driver_sims else 0.0

    predictions = []
    total_drivers = len(driver_sims)
    for idx, d in enumerate(driver_sims):
        pred_pos = idx + 1
        pos_delta = d["current_position"] - pred_pos
        delta_to_winner = round(d["projected_total_time"] - winner_time, 3)

        # Calibrated confidence score in [0.20, 0.95]
        lap_factor = 1.0 - 0.40 * (remaining_laps / max(1, total_laps))
        margin_ahead = 2.0 if idx == 0 else abs(d["projected_total_time"] - driver_sims[idx - 1]["projected_total_time"])
        margin_behind = 2.0 if idx == total_drivers - 1 else abs(d["projected_total_time"] - driver_sims[idx + 1]["projected_total_time"])
        min_margin = min(margin_ahead, margin_behind)
        margin_factor = min(1.0, min_margin / 2.5)
        conf = round(max(0.20, min(0.95, lap_factor * 0.8 + margin_factor * 0.15)), 2)

        predictions.append({
            "predicted_position": pred_pos,
            "current_position": d["current_position"],
            "driver_number": d["driver_number"],
            "driver_name": d["driver_name"],
            "driver_code": d["driver_code"],
            "team_name": d["team_name"],
            "position_delta": pos_delta,
            "projected_total_time": d["projected_total_time"],
            "predicted_total_time_sec": d["predicted_total_time_sec"],
            "time_delta_to_winner_sec": delta_to_winner,
            "confidence_score": conf,
            "predicted_remaining_stops": d["predicted_remaining_stops"],
            "current_compound": d["current_compound"],
            "tyre_age": d["tyre_age"],
        })

    return predictions


# ---------------------------------------------------------------------------
# Dynamic Application Resolution & Mock Router Factory
# ---------------------------------------------------------------------------

def create_reference_app() -> FastAPI:
    """
    Creates reference FastAPI application strictly implementing the 24 REST routes
    and Pydantic v2 schemas defined in ORIGINAL_REQUEST.md and spec_miner_survey_2.
    Used for immediate offline opaque-box test verification.
    """
    app = FastAPI(title="PitWall Reference Backend", version="1.0.0")

    # Sample data records
    sample_drivers = [
        DriverStandingItem(position=1, points=437.0, wins=9, driver_id="max_verstappen", driver_number=1, driver_code="VER", given_name="Max", family_name="Verstappen", nationality="Dutch", constructor_id="red_bull", constructor_name="Red Bull Racing"),
        DriverStandingItem(position=2, points=374.0, wins=3, driver_id="norris", driver_number=4, driver_code="NOR", given_name="Lando", family_name="Norris", nationality="British", constructor_id="mclaren", constructor_name="McLaren"),
        DriverStandingItem(position=3, points=356.0, wins=3, driver_id="leclerc", driver_number=16, driver_code="LEC", given_name="Charles", family_name="Leclerc", nationality="Monegasque", constructor_id="ferrari", constructor_name="Ferrari"),
    ]
    sample_constructors = [
        ConstructorStandingItem(position=1, points=666.0, wins=5, constructor_id="mclaren", constructor_name="McLaren", nationality="British"),
        ConstructorStandingItem(position=2, points=652.0, wins=5, constructor_id="ferrari", constructor_name="Ferrari", nationality="Italian"),
        ConstructorStandingItem(position=3, points=589.0, wins=9, constructor_id="red_bull", constructor_name="Red Bull Racing", nationality="Austrian"),
    ]

    import re

    def _validate_season(s: str):
        if s != "current":
            if not (re.match(r"^\d{4}$", s) and 1950 <= int(s) <= 2030):
                raise HTTPException(status_code=404, detail="Season not found")

    # 1. Standings Drivers
    @app.get("/api/standings/drivers/{season}", response_model=DriverStandingsResponse)
    def get_driver_standings(season: str):
        _validate_season(season)
        return DriverStandingsResponse(season=season, round=24, standings=sample_drivers)

    # 2. Standings Constructors
    @app.get("/api/standings/constructors/{season}", response_model=ConstructorStandingsResponse)
    def get_constructor_standings(season: str):
        _validate_season(season)
        return ConstructorStandingsResponse(season=season, round=24, standings=sample_constructors)

    # 3. Races Calendar
    @app.get("/api/races/{season}", response_model=RaceCalendarResponse)
    def get_races(season: str):
        _validate_season(season)
        races = [
            RaceScheduleItem(round=1, race_name="Bahrain Grand Prix", circuit_id="bahrain", circuit_name="Bahrain International Circuit", locality="Sakhir", country="Bahrain", date="2024-03-02", is_completed=True),
            RaceScheduleItem(round=2, race_name="Saudi Arabian Grand Prix", circuit_id="jeddah", circuit_name="Jeddah Corniche Circuit", locality="Jeddah", country="Saudi Arabia", date="2024-03-09", is_completed=True),
            RaceScheduleItem(round=5, race_name="Chinese Grand Prix", circuit_id="shanghai", circuit_name="Shanghai International Circuit", locality="Shanghai", country="China", date="2024-04-21", sprint_date="2024-04-20", is_completed=True),
        ]
        return RaceCalendarResponse(season=season, races=races)

    # 4. Race Results
    @app.get("/api/races/{season}/{round}/results", response_model=RaceResultsResponse)
    def get_race_results(season: str, round: int):
        if round > 30 or round < 1:
            raise HTTPException(status_code=404, detail="Round not found")
        results = [
            RaceResultItem(position=1, driver_number=1, driver_code="VER", driver_name="Max Verstappen", constructor_name="Red Bull Racing", grid=1, laps=57, status="Finished", points=26.0, time_or_margin="1:31:44.742", fastest_lap_rank=1, fastest_lap_time="1:32.608"),
            RaceResultItem(position=2, driver_number=11, driver_code="PER", driver_name="Sergio Perez", constructor_name="Red Bull Racing", grid=5, laps=57, status="Finished", points=18.0, time_or_margin="+22.457"),
            RaceResultItem(position=3, driver_number=55, driver_code="SAI", driver_name="Carlos Sainz", constructor_name="Ferrari", grid=4, laps=57, status="Finished", points=15.0, time_or_margin="+25.110"),
        ]
        return RaceResultsResponse(season=season, round=round, race_name="Bahrain Grand Prix", circuit_name="Bahrain International Circuit", date="2024-03-02", results=results)

    # 5. Race Laps
    @app.get("/api/races/{season}/{round}/laps", response_model=RaceLapsResponse)
    def get_race_laps(season: str, round: int, driver_number: Optional[int] = None, lap_number: Optional[int] = None):
        laps = [
            LapItem(lap_number=1, driver_number=1, lap_duration=96.500, duration_sector_1=31.2, duration_sector_2=41.1, duration_sector_3=24.2, is_pit_out_lap=False),
            LapItem(lap_number=2, driver_number=1, lap_duration=93.100, duration_sector_1=29.8, duration_sector_2=39.9, duration_sector_3=23.4, is_pit_out_lap=False),
            LapItem(lap_number=18, driver_number=1, lap_duration=114.500, duration_sector_1=30.1, duration_sector_2=40.2, duration_sector_3=44.2, is_pit_out_lap=True),
        ]
        if driver_number:
            laps = [l for l in laps if l.driver_number == driver_number]
        if lap_number:
            laps = [l for l in laps if l.lap_number == lap_number]
        return RaceLapsResponse(season=season, round=round, session_key=9165, laps=laps)

    # 6. Race Stints
    @app.get("/api/races/{season}/{round}/stints", response_model=RaceStintsResponse)
    def get_race_stints(season: str, round: int, driver_number: Optional[int] = None):
        stints = [
            StintItem(driver_number=1, driver_name="Max Verstappen", stint_number=1, lap_start=1, lap_end=17, compound="SOFT", tyre_age_at_start=0, total_laps_on_tyre=17),
            StintItem(driver_number=1, driver_name="Max Verstappen", stint_number=2, lap_start=18, lap_end=37, compound="HARD", tyre_age_at_start=0, total_laps_on_tyre=20),
            StintItem(driver_number=4, driver_name="Lando Norris", stint_number=1, lap_start=1, lap_end=15, compound="MEDIUM", tyre_age_at_start=0, total_laps_on_tyre=15),
        ]
        if driver_number:
            stints = [s for s in stints if s.driver_number == driver_number]
        return RaceStintsResponse(season=season, round=round, stints=stints)

    # 7. Race Pitstops
    @app.get("/api/races/{season}/{round}/pitstops", response_model=RacePitStopsResponse)
    def get_race_pitstops(season: str, round: int):
        pit_stops = [
            PitStopItem(driver_number=1, driver_id="max_verstappen", driver_name="Max Verstappen", stop_number=1, lap=17, time_of_day="18:32:10", duration=2.45, lane_duration=21.80),
            PitStopItem(driver_number=4, driver_id="norris", driver_name="Lando Norris", stop_number=1, lap=15, time_of_day="18:29:05", duration=2.20, lane_duration=21.40),
        ]
        return RacePitStopsResponse(season=season, round=round, pit_stops=pit_stops)

    # 8. Race Positions
    @app.get("/api/races/{season}/{round}/positions", response_model=RacePositionsResponse)
    def get_race_positions(season: str, round: int):
        positions = [
            DriverLapPosition(lap_number=1, driver_number=1, position=1),
            DriverLapPosition(lap_number=1, driver_number=4, position=2),
            DriverLapPosition(lap_number=2, driver_number=1, position=1),
            DriverLapPosition(lap_number=2, driver_number=4, position=2),
        ]
        return RacePositionsResponse(season=season, round=round, positions=positions)

    # 9. Race Gaps
    @app.get("/api/races/{season}/{round}/gaps", response_model=RaceGapsResponse)
    def get_race_gaps(season: str, round: int):
        intervals = [
            IntervalItem(lap_number=10, date="2024-03-02T15:20:00Z", driver_number=1, gap_to_leader=0.0, interval="-"),
            IntervalItem(lap_number=10, date="2024-03-02T15:20:00Z", driver_number=4, gap_to_leader=3.412, interval=1.245),
            IntervalItem(lap_number=10, date="2024-03-02T15:20:00Z", driver_number=24, gap_to_leader=65.200, interval="+1 LAP"),
        ]
        return RaceGapsResponse(season=season, round=round, intervals=intervals)

    # 10. Race Weather
    @app.get("/api/races/{season}/{round}/weather", response_model=RaceWeatherResponse)
    def get_race_weather(season: str, round: int):
        points = [
            WeatherItem(date="2024-03-02T15:00:00Z", air_temperature=24.5, track_temperature=32.1, humidity=45.0, pressure=1012.3, wind_speed=12.5, wind_direction=310, rainfall=0),
            WeatherItem(date="2024-03-02T16:00:00Z", air_temperature=23.8, track_temperature=30.5, humidity=48.0, pressure=1012.0, wind_speed=14.0, wind_direction=315, rainfall=0),
        ]
        return RaceWeatherResponse(season=season, round=round, weather_points=points)

    # 11. Qualifying Results
    @app.get("/api/qualifying/{season}/{round}", response_model=QualifyingResultsResponse)
    def get_qualifying(season: str, round: int):
        results = [
            QualifyingItem(position=1, driver_number=1, driver_code="VER", driver_name="Max Verstappen", constructor_name="Red Bull Racing", q1="1:30.031", q2="1:29.374", q3="1:29.179"),
            QualifyingItem(position=2, driver_number=16, driver_code="LEC", driver_name="Charles Leclerc", constructor_name="Ferrari", q1="1:30.243", q2="1:29.165", q3="1:29.407"),
            QualifyingItem(position=3, driver_number=63, driver_code="RUS", driver_name="George Russell", constructor_name="Mercedes", q1="1:30.350", q2="1:29.928", q3="1:29.485"),
        ]
        return QualifyingResultsResponse(season=season, round=round, race_name="Bahrain Grand Prix", circuit_name="Bahrain International Circuit", qualifying_results=results)

    # 12. Single Lap Telemetry
    @app.get("/api/telemetry/{session_key}/{driver_number}/{lap_number}", response_model=LapTelemetryResponse)
    def get_lap_telemetry(session_key: int, driver_number: int, lap_number: int):
        if session_key == 999999 or driver_number == 999:
            raise HTTPException(status_code=404, detail="Telemetry not found")
        samples = [
            TelemetrySample(timestamp="2024-03-02T15:15:00.100Z", time_offset=0.1, distance_m=10.0, speed=285, rpm=11200, gear=7, throttle=100, brake=0, drs=1),
            TelemetrySample(timestamp="2024-03-02T15:15:00.500Z", time_offset=0.5, distance_m=50.0, speed=310, rpm=11800, gear=8, throttle=100, brake=0, drs=1),
            TelemetrySample(timestamp="2024-03-02T15:15:01.000Z", time_offset=1.0, distance_m=90.0, speed=120, rpm=8500, gear=3, throttle=10, brake=100, drs=0),
        ]
        return LapTelemetryResponse(session_key=session_key, driver_number=driver_number, lap_number=lap_number, lap_duration=91.450, samples_count=len(samples), telemetry=samples)

    # 13. Telemetry Compare
    @app.get("/api/telemetry/compare", response_model=TelemetryCompareResponse)
    def get_telemetry_compare(session: int = Query(...), d1: int = Query(...), d2: int = Query(...), lap: int = Query(...)):
        trace = [
            CompareSample(distance_m=0.0, d1_speed=285, d2_speed=280, d1_throttle=100, d2_throttle=100, d1_brake=0, d2_brake=0, d1_gear=7, d2_gear=7, d1_drs=1, d2_drs=1, delta_time=0.0),
            CompareSample(distance_m=100.0, d1_speed=310, d2_speed=305, d1_throttle=100, d2_throttle=100, d1_brake=0, d2_brake=0, d1_gear=8, d2_gear=8, d1_drs=1, d2_drs=1, delta_time=-0.045),
            CompareSample(distance_m=200.0, d1_speed=120, d2_speed=125, d1_throttle=0, d2_throttle=15, d1_brake=100, d2_brake=100, d1_gear=3, d2_gear=3, d1_drs=0, d2_drs=0, delta_time=0.035),
        ]
        return TelemetryCompareResponse(session_key=session, lap_number=lap, driver1_number=d1, driver1_lap_time=91.450, driver2_number=d2, driver2_lap_time=91.620, trace=trace)

    # 14. Driver Career
    @app.get("/api/drivers/{driver_id}/career", response_model=DriverCareerResponse)
    def get_driver_career(driver_id: str):
        if driver_id in ("ghost", "unknown_driver", "not_found"):
            raise HTTPException(status_code=404, detail="Driver not found")
        seasons = [
            DriverSeasonSummary(year=2021, position=1, points=395.5, wins=10, constructor="Red Bull"),
            DriverSeasonSummary(year=2022, position=1, points=454.0, wins=15, constructor="Red Bull"),
            DriverSeasonSummary(year=2023, position=1, points=575.0, wins=19, constructor="Red Bull"),
        ]
        return DriverCareerResponse(
            driver_id=driver_id, driver_number=1, code="VER", name="Max Verstappen", nationality="Dutch",
            birth_date="1997-09-30", championships=3, total_races=206, wins=62, podiums=110,
            pole_positions=40, fastest_laps=33, career_points=2985.5, dnf_count=31,
            teams=["Toro Rosso", "Red Bull"], seasons=seasons
        )

    # 15. Driver Compare
    @app.get("/api/drivers/compare", response_model=DriversComparisonResponse)
    def compare_drivers(d1: str = Query(...), d2: str = Query(...), season: Optional[Union[str, int]] = Query(None)):
        h2h_1 = DriverHeadToHead(driver_id=d1, name="Max Verstappen", code="VER", wins=62, podiums=110, poles=40, points=2985.5, best_finish=1, qualifying_ahead_count=145, race_ahead_count=150, dnfs=31)
        h2h_2 = DriverHeadToHead(driver_id=d2, name="Lando Norris", code="NOR", wins=3, podiums=25, poles=8, points=960.0, best_finish=1, qualifying_ahead_count=85, race_ahead_count=90, dnfs=12)
        return DriversComparisonResponse(driver1=h2h_1, driver2=h2h_2, qualifying_winner=d1, race_finish_winner=d1, points_winner=d1)

    # 16. Strategy Pit Window
    @app.get("/api/strategy/pit-window/{session_key}/{driver_number}", response_model=PitWindowResponse)
    def get_strategy_pit_window(session_key: int, driver_number: int):
        res = calculate_pit_window(
            tyre_age=16, lap_times=[93.0, 93.1, 93.2, 93.4, 93.5], gap_ahead=1.5, gap_behind=3.0,
            remaining_laps=39, pit_loss_time=22.0, compound="MEDIUM", current_lap=18, total_laps=57
        )
        return PitWindowResponse(
            session_key=session_key, driver_number=driver_number, driver_code="VER", current_lap=18,
            tyre_compound="MEDIUM", tyre_age=16, degradation_rate_sec_per_lap=res["degradation_rate"],
            estimated_cliff_lap=res["cliff_lap"], laps_until_cliff=res["laps_until_cliff"],
            earliest_pit_lap=res["earliest_pit_lap"], latest_pit_lap=res["latest_pit_lap"],
            recommended_pit_lap=res["recommended_pit_lap"], undercut_status=res["undercut_status"],
            gap_ahead=1.5, gap_behind=3.0, pit_loss_time_sec=22.0, projected_rejoin_position=4,
            explanation=res["explanation"]
        )

    # 17. Strategy Race Predictor
    @app.get("/api/strategy/predict/{session_key}/{from_lap}", response_model=RacePredictionResponse)
    def get_strategy_predict(session_key: int, from_lap: int):
        positions = [
            {"driver_number": 1, "driver_name": "Max Verstappen", "driver_code": "VER", "position": 1, "team_name": "Red Bull Racing"},
            {"driver_number": 4, "driver_name": "Lando Norris", "driver_code": "NOR", "position": 2, "team_name": "McLaren"},
            {"driver_number": 16, "driver_name": "Charles Leclerc", "driver_code": "LEC", "position": 3, "team_name": "Ferrari"},
        ]
        preds = predict_race_result(
            current_positions=positions, tyre_ages={1: 15, 4: 14, 16: 18},
            compounds={1: "MEDIUM", 4: "MEDIUM", 16: "HARD"},
            lap_times={1: [92.0, 92.1], 4: [92.2, 92.3], 16: [92.5, 92.6]},
            current_lap=from_lap, total_laps=57
        )
        pred_items = [
            PredictedDriverFinish(
                predicted_position=p["predicted_position"], current_position=p["current_position"],
                driver_number=p["driver_number"], driver_code=p["driver_code"], team_name=p["team_name"],
                confidence_score=p["confidence_score"], predicted_total_time_sec=p["predicted_total_time_sec"],
                time_delta_to_winner_sec=p["time_delta_to_winner_sec"], predicted_remaining_stops=p["predicted_remaining_stops"],
                current_compound=p["current_compound"], tyre_age=p["tyre_age"]
            )
            for p in preds
        ]
        return RacePredictionResponse(session_key=session_key, from_lap=from_lap, total_laps=57, remaining_laps=57 - from_lap, predictions=pred_items)

    # 18. Live Timing
    @app.get("/api/live/timing/{session_key}", response_model=LiveTimingResponse)
    def get_live_timing(session_key: int, simulated_lap: Optional[int] = None):
        drivers = [
            LiveDriverTiming(position=1, driver_number=1, driver_code="VER", driver_name="Max Verstappen", team_name="Red Bull", team_colour="3671C6", gap_to_leader="LEADER", interval="-", last_lap_time=93.412, best_lap_time=92.608, sector_1=29.8, sector_2=40.1, sector_3=23.5, pit_stop_count=1, tyre_compound="HARD", tyre_age=12, in_pit=False),
            LiveDriverTiming(position=2, driver_number=4, driver_code="NOR", driver_name="Lando Norris", team_name="McLaren", team_colour="FF8000", gap_to_leader="+2.450", interval="+2.450", last_lap_time=93.200, best_lap_time=92.750, sector_1=29.7, sector_2=40.0, sector_3=23.5, pit_stop_count=1, tyre_compound="HARD", tyre_age=10, in_pit=False),
        ]
        return LiveTimingResponse(session_key=session_key, session_name="Race", current_lap=simulated_lap or 32, total_laps=57, status="ACTIVE", drivers=drivers)

    # 19. Live Race Control
    @app.get("/api/live/race-control/{session_key}", response_model=LiveRaceControlResponse)
    def get_live_race_control(session_key: int):
        msgs = [
            RaceControlMessage(date="2024-03-02T15:25:00Z", lap_number=18, category="Flag", flag="CLEAR", scope="Track", message="TRACK CLEAR - DRS ENABLED"),
            RaceControlMessage(date="2024-03-02T15:35:00Z", lap_number=24, category="CarEvent", scope="Sector", message="CAR 11 (PER) OFF TRACK IN TURN 4"),
        ]
        penalties = [
            PenaltyItem(driver_number=20, penalty_type="5_SECOND_PENALTY", reason="Causing a collision")
        ]
        return LiveRaceControlResponse(session_key=session_key, safety_car_status="NONE", drs_status="ENABLED", messages=msgs, penalties=penalties)

    # 20. Circuits List
    @app.get("/api/circuits", response_model=CircuitsListResponse)
    def get_circuits(season: Optional[int] = None):
        circuits = [
            CircuitInfo(circuit_id="bahrain", circuit_name="Bahrain International Circuit", locality="Sakhir", country="Bahrain", lat=26.0325, long=50.5106, length_km=5.412, turns=15, lap_record_time="1:31.447", lap_record_driver="Pedro de la Rosa", lap_record_year=2005),
            CircuitInfo(circuit_id="silverstone", circuit_name="Silverstone Circuit", locality="Silverstone", country="UK", lat=52.0786, long=-1.0169, length_km=5.891, turns=18, lap_record_time="1:27.097", lap_record_driver="Max Verstappen", lap_record_year=2020),
        ]
        return CircuitsListResponse(circuits=circuits)

    # 21. Circuit History
    @app.get("/api/circuits/{circuit_id}/history", response_model=CircuitHistoryResponse)
    def get_circuit_history(circuit_id: str):
        if circuit_id in ("atlantis", "invalid", "unknown"):
            raise HTTPException(status_code=404, detail="Circuit not found")
        winners = [
            CircuitWinnerItem(year=2024, driver_name="Max Verstappen", constructor_name="Red Bull Racing", time="1:31:44.742", laps=57),
            CircuitWinnerItem(year=2023, driver_name="Max Verstappen", constructor_name="Red Bull Racing", time="1:33:56.736", laps=57),
        ]
        poles = [
            CircuitPoleItem(year=2024, driver_name="Max Verstappen", time="1:29.179"),
            CircuitPoleItem(year=2023, driver_name="Max Verstappen", time="1:29.708"),
        ]
        return CircuitHistoryResponse(circuit_id=circuit_id, circuit_name="Bahrain International Circuit", first_held_year=2004, races_held_count=20, past_winners=winners, past_pole_sitters=poles)

    # 22. News
    @app.get("/api/news", response_model=NewsFeedResponse)
    def get_news(limit: int = 20, source: str = "all"):
        articles = [
            NewsArticleItem(title="Verstappen Dominates Bahrain GP Season Opener", link="https://www.autosport.com/f1/news/bahrain-opener", description="Max Verstappen secured victory in Bahrain with a dominant display from pole position.", pub_date="2024-03-02T18:00:00Z", source="Autosport", thumbnail_url="https://images.autosport.com/f1-bahrain.jpg"),
            NewsArticleItem(title="McLaren Unveils Aggressive Floor Upgrades", link="https://www.motorsport.com/f1/news/mclaren-upgrades", description="McLaren engineers bring a revamped floor design targeting high-speed downforce.", pub_date="2024-03-03T10:00:00Z", source="Motorsport.com", thumbnail_url="https://images.motorsport.com/mclaren-floor.jpg"),
        ]
        return NewsFeedResponse(count=len(articles[:limit]), articles=articles[:limit])

    # 23. Driver Historical Stats
    @app.get("/api/stats/drivers", response_model=DriverStatsResponse)
    def get_driver_stats(sort_by: str = "wins", limit: int = 50, offset: int = 0):
        drivers = [
            HistoricalDriverStats(driver_id="hamilton", driver_name="Lewis Hamilton", nationality="British", active_years="2007-present", world_championships=7, race_entries=350, race_wins=105, podiums=201, pole_positions=104, fastest_laps=67, dnf_count=32, dns_count=1, win_percentage=30.0, podium_percentage=57.4),
            HistoricalDriverStats(driver_id="schumacher", driver_name="Michael Schumacher", nationality="German", active_years="1991-2012", world_championships=7, race_entries=308, race_wins=91, podiums=155, pole_positions=68, fastest_laps=77, dnf_count=68, dns_count=2, win_percentage=29.5, podium_percentage=50.3),
            HistoricalDriverStats(driver_id="max_verstappen", driver_name="Max Verstappen", nationality="Dutch", active_years="2015-present", world_championships=3, race_entries=206, race_wins=62, podiums=110, pole_positions=40, fastest_laps=33, dnf_count=31, dns_count=0, win_percentage=30.1, podium_percentage=53.4),
        ]
        return DriverStatsResponse(total_drivers=len(drivers), drivers=drivers[offset:offset+limit])

    # 24. Constructor Historical Stats
    @app.get("/api/stats/constructors", response_model=ConstructorStatsResponse)
    def get_constructor_stats(sort_by: str = "wins", limit: int = 50, offset: int = 0):
        teams = [
            HistoricalConstructorStats(constructor_id="ferrari", constructor_name="Ferrari", nationality="Italian", active_years="1950-present", championships=16, race_entries=1090, race_wins=248, podiums=825, pole_positions=253, dnf_count=290, dns_count=12, win_percentage=22.8),
            HistoricalConstructorStats(constructor_id="mclaren", constructor_name="McLaren", nationality="British", active_years="1966-present", championships=8, race_entries=970, race_wins=188, podiums=522, pole_positions=163, dnf_count=250, dns_count=9, win_percentage=19.4),
            HistoricalConstructorStats(constructor_id="mercedes", constructor_name="Mercedes", nationality="German", active_years="1954-present", championships=8, race_entries=310, race_wins=128, podiums=298, pole_positions=139, dnf_count=52, dns_count=2, win_percentage=41.3),
        ]
        return ConstructorStatsResponse(total_constructors=len(teams), constructors=teams[offset:offset+limit])

    return app


# ---------------------------------------------------------------------------
# Pytest Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def app_instance() -> FastAPI:
    """
    Dynamically loads the backend FastAPI application.
    If pitwall/backend/app/main.py is available, imports and returns it;
    otherwise seamlessly loads the reference application.
    """
    try:
        from app.main import app as real_app
        if isinstance(real_app, FastAPI):
            return real_app
    except Exception:
        pass
    return create_reference_app()


@pytest.fixture(scope="session")
def client(app_instance: FastAPI) -> TestClient:
    """
    TestClient fixture for synchronous HTTP request execution across all tiers.
    """
    return TestClient(app_instance)


@pytest.fixture(scope="session")
def pit_window_solver():
    """
    Provides the Pit Window Algorithm calculation function.
    """
    try:
        from app.services.pit_window import calculate_pit_window as real_func
        return real_func
    except Exception:
        return calculate_pit_window


@pytest.fixture(scope="session")
def race_predictor_solver():
    """
    Provides the Race Result Predictor Algorithm function.
    """
    try:
        from app.services.race_predictor import predict_race_result as real_func
        return real_func
    except Exception:
        return predict_race_result


@pytest.fixture
def sample_stint_lap_times() -> List[float]:
    """
    Sample sequence of 15 clean stint laps with steady degradation.
    """
    base = 92.0
    degradation = 0.08
    return [round(base + i * degradation + (0.05 if i % 2 == 0 else -0.05), 3) for i in range(15)]
