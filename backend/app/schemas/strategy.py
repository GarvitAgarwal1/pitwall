"""Pydantic v2 schemas for Pit Window Optimization and Race Result Prediction."""

from typing import List, Optional
from pydantic import BaseModel, Field


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
    undercut_status: str  # 'HIGHLY_VIABLE', 'VIABLE', 'MARGINAL', 'NOT_VIABLE'
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
    confidence_score: float  # 0.0 to 1.0
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
