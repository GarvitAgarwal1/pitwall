"""Strategy Router: Pit Window Optimization and Race Result Prediction Algorithms."""

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Path, Query

from app.schemas.strategy import (
    PitWindowResponse,
    PredictedDriverFinish,
    RacePredictionResponse,
)
from app.services.pit_window import calculate_pit_window
from app.services.race_predictor import predict_race_result
from app.services.replay_engine import replay_engine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/strategy", tags=["strategy"])


@router.get("/pit-window/{session_key}/{driver_number}", response_model=PitWindowResponse)
async def get_pit_window(
    session_key: int = Path(..., description="Session key"),
    driver_number: int = Path(..., description="Driver number"),
    tyre_age: Optional[int] = Query(None, description="Current tyre age in laps"),
    compound: Optional[str] = Query("MEDIUM", description="Tyre compound (SOFT, MEDIUM, HARD)"),
    gap_ahead: Optional[float] = Query(None, description="Gap to car ahead in seconds"),
    gap_behind: Optional[float] = Query(None, description="Gap to car behind in seconds"),
    current_lap: Optional[int] = Query(None, description="Current race lap"),
    remaining_laps: Optional[int] = Query(None, description="Laps remaining in Grand Prix"),
) -> PitWindowResponse:
    """
    Calculate optimal pit stop window, degradation rate, tyre cliff lap,
    and undercut viability using linear regression and thermal wear models.
    """
    # 1. Inspect live replay engine state to gather context if params omitted
    live_state = await replay_engine.get_live_timing(session_key=session_key, simulated_lap=current_lap)
    matching_driver = next(
        (d for d in live_state.get("drivers", []) if d["driver_number"] == driver_number),
        None,
    )

    eff_current_lap = current_lap if current_lap is not None else live_state.get("current_lap", 25)
    total_laps = live_state.get("total_laps", 57)
    eff_remaining = remaining_laps if remaining_laps is not None else max(1, total_laps - eff_current_lap)

    eff_age = tyre_age if tyre_age is not None else (matching_driver["tyre_age"] if matching_driver else 16)
    eff_compound = compound if compound else (matching_driver["tyre_compound"] if matching_driver else "MEDIUM")
    eff_gap_ahead = gap_ahead if gap_ahead is not None else 1.45
    eff_gap_behind = gap_behind if gap_behind is not None else 2.80

    # Build sequence of lap times reflecting degradation
    base_time = 92.20
    lap_times = [
        round(base_time + (i * 0.08) + ((i % 3) * 0.05), 3)
        for i in range(max(3, eff_age))
    ]

    # Execute Pit Window Algorithm
    result = calculate_pit_window(
        tyre_age=eff_age,
        lap_times=lap_times,
        gap_ahead=eff_gap_ahead,
        gap_behind=eff_gap_behind,
        remaining_laps=eff_remaining,
        pit_loss_time=22.0,
        compound=eff_compound,
        current_lap=eff_current_lap,
    )

    # Classify undercut status
    raw_status = result["undercut_status"]
    if raw_status == "viable":
        status_label = "HIGHLY_VIABLE" if eff_gap_ahead <= 1.2 else "VIABLE"
    elif raw_status == "marginal":
        status_label = "MARGINAL"
    else:
        status_label = "NOT_VIABLE"

    driver_code = matching_driver["driver_code"] if matching_driver else f"D{driver_number}"
    current_pos = matching_driver["position"] if matching_driver else 3
    rejoin_pos = min(20, current_pos + 4)

    explanation = (
        f"Tyre degradation currently measured at {result['degradation_rate']:.3f}s/lap on {eff_compound.upper()}. "
        f"Tyre cliff expected at lap age {result['cliff_lap']} ({result['laps_until_cliff']} laps remaining). "
        f"Undercut on car ahead is {status_label}. Optimal pit entry is lap {result['recommended_pit_lap']}."
    )

    return PitWindowResponse(
        session_key=session_key,
        driver_number=driver_number,
        driver_code=driver_code,
        current_lap=eff_current_lap,
        tyre_compound=eff_compound.upper(),
        tyre_age=eff_age,
        degradation_rate_sec_per_lap=result["degradation_rate"],
        estimated_cliff_lap=result["cliff_lap"],
        laps_until_cliff=result["laps_until_cliff"],
        earliest_pit_lap=result["earliest_pit_lap"],
        latest_pit_lap=result["latest_pit_lap"],
        recommended_pit_lap=result["recommended_pit_lap"],
        undercut_status=status_label,
        gap_ahead=eff_gap_ahead,
        gap_behind=eff_gap_behind,
        pit_loss_time_sec=result["pit_loss_time"],
        projected_rejoin_position=rejoin_pos,
        explanation=explanation,
    )


@router.get("/predict/{session_key}/{from_lap}", response_model=RacePredictionResponse)
async def predict_race(
    session_key: int = Path(..., description="Session key"),
    from_lap: int = Path(..., description="Starting lap for prediction simulation"),
    total_laps: Optional[int] = Query(57, description="Total race laps"),
) -> RacePredictionResponse:
    """
    Project race finishing order with statistical confidence scores
    by simulating remaining laps with tyre wear, fuel burn, and pit stop strategies.
    """
    timing = await replay_engine.get_live_timing(session_key=session_key, simulated_lap=from_lap)
    drivers = timing.get("drivers", [])

    current_positions: List[Dict[str, Any]] = []
    tyre_ages: Dict[int, int] = {}
    compounds: Dict[int, str] = {}
    lap_times: Dict[int, List[float]] = {}

    for d in drivers:
        d_num = d["driver_number"]
        pos = d["position"]
        # Parse gap
        gap_str = d.get("gap_to_leader", "0.0")
        try:
            gap_val = float(gap_str.replace("+", "").replace("s", "")) if gap_str != "LEADER" else 0.0
        except Exception:
            gap_val = (pos - 1) * 2.0

        current_positions.append({
            "driver_number": d_num,
            "driver_name": d["driver_name"],
            "team": d["team_name"],
            "current_position": pos,
            "gap": gap_val,
        })
        tyre_ages[d_num] = d.get("tyre_age", 15)
        compounds[d_num] = d.get("tyre_compound", "MEDIUM")
        last_t = d.get("last_lap_time", 92.5)
        lap_times[d_num] = [round(last_t - 0.2, 3), round(last_t, 3), round(last_t + 0.1, 3)]

    sim_predictions = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=from_lap,
        total_laps=total_laps or 57,
        pit_loss_time=22.0,
    )

    winner_time = sim_predictions[0]["projected_total_time"] if sim_predictions else 0.0

    predictions: List[PredictedDriverFinish] = []
    for p in sim_predictions:
        d_num = p["driver_number"]
        match_driver = next((d for d in drivers if d["driver_number"] == d_num), None)
        code = match_driver["driver_code"] if match_driver else f"D{d_num}"

        predictions.append(
            PredictedDriverFinish(
                predicted_position=p["predicted_position"],
                current_position=p["current_position"],
                driver_number=d_num,
                driver_code=code,
                team_name=p["team"],
                confidence_score=p["confidence_score"],
                predicted_total_time_sec=p["projected_total_time"],
                time_delta_to_winner_sec=round(max(0.0, p["projected_total_time"] - winner_time), 3),
                predicted_remaining_stops=p["projected_pit_stops"],
                current_compound=compounds.get(d_num, "MEDIUM"),
                tyre_age=tyre_ages.get(d_num, 0),
            )
        )

    remaining = max(0, (total_laps or 57) - from_lap)

    return RacePredictionResponse(
        session_key=session_key,
        from_lap=from_lap,
        total_laps=total_laps or 57,
        remaining_laps=remaining,
        predictions=predictions,
    )
