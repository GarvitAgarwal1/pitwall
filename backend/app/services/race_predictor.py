"""Race Result Predictor Service.

Projects race finishing order by simulating remaining stint laps for each driver,
incorporating tyre degradation, fuel burn correction (-0.030s/lap), pit stop
strategies, and calculating statistical confidence scores.
"""

from __future__ import annotations

import math
import statistics
from typing import Any

# Compound baseline characteristics for simulation
COMPOUND_PROPERTIES: dict[str, dict[str, Any]] = {
    "SOFT": {
        "deg_rate": 0.120,
        "max_life": 20,
        "next_compound": "HARD",
    },
    "MEDIUM": {
        "deg_rate": 0.075,
        "max_life": 28,
        "next_compound": "HARD",
    },
    "HARD": {
        "deg_rate": 0.045,
        "max_life": 40,
        "next_compound": "MEDIUM",
    },
    "INTERMEDIATE": {
        "deg_rate": 0.090,
        "max_life": 25,
        "next_compound": "MEDIUM",
    },
    "WET": {
        "deg_rate": 0.080,
        "max_life": 35,
        "next_compound": "INTERMEDIATE",
    },
}

DEFAULT_COMPOUND = "MEDIUM"
FUEL_BURN_EFFECT_SEC_PER_LAP = 0.030  # Pace gain from fuel consumption per completed lap
DEFAULT_BASE_PACE = 90.0  # Fallback lap time in seconds when no telemetry is available


def _clean_lap_times(times: list[float]) -> list[float]:
    """Filter out non-numeric, null, and non-positive lap times."""
    if not times:
        return []
    return [
        float(t)
        for t in times
        if isinstance(t, (int, float)) and not math.isnan(t) and t > 0
    ]


def _filter_lap_outliers(laps: list[float]) -> list[float]:
    """Remove outlier lap times caused by Safety Cars, VSC, or pit in/out laps."""
    if len(laps) < 3:
        return laps.copy()

    sorted_laps = sorted(laps)
    n = len(sorted_laps)
    median_pace = (
        sorted_laps[n // 2]
        if n % 2 != 0
        else (sorted_laps[n // 2 - 1] + sorted_laps[n // 2]) / 2.0
    )
    # Laps within 85% to 108% of median pace represent clean representative laps
    clean = [t for t in laps if 0.85 * median_pace <= t <= 1.08 * median_pace]
    return clean if clean else laps.copy()


def predict_race_result(
    current_positions: list[dict[str, Any]],
    tyre_ages: dict[int, int],
    compounds: dict[int, str],
    lap_times: dict[int, list[float]],
    current_lap: int,
    total_laps: int,
    pit_loss_time: float = 22.0,
) -> list[dict[str, Any]]:
    """Predict race finishing order and calculate projection confidence scores.

    Args:
        current_positions: List of dictionaries with driver positions, numbers, and names.
        tyre_ages: Mapping of driver_number to current tyre age in laps.
        compounds: Mapping of driver_number to current tyre compound string.
        lap_times: Mapping of driver_number to historical lap times in seconds.
        current_lap: Current race lap number.
        total_laps: Total scheduled race laps.
        pit_loss_time: Time in seconds lost during a pit stop (in-lap + stop + out-lap).

    Returns:
        List of dictionaries sorted by predicted finishing position:
            - predicted_position: int
            - driver_number: int
            - driver_name: str
            - team: str
            - current_position: int
            - position_delta: int (current_position - predicted_position)
            - projected_total_time: float (seconds)
            - confidence_score: float (0.0 to 1.0)
            - projected_pit_stops: int
    """
    if not current_positions:
        return []

    current_lap = max(0, int(current_lap))
    total_laps = max(current_lap, int(total_laps))
    remaining_laps = max(0, total_laps - current_lap)
    pit_loss_time = max(0.0, float(pit_loss_time))

    # Phase 1: Determine base clean pace and initial interval for each driver
    driver_sim_profiles: list[dict[str, Any]] = []

    # First pass: collect available paces to calculate grid median fallback
    all_raw_paces: list[float] = []
    for d in current_positions:
        num = d.get("driver_number")
        if num is not None and num in lap_times:
            clean = _filter_lap_outliers(_clean_lap_times(lap_times[num]))
            if clean:
                recent = clean[-5:]
                all_raw_paces.append(statistics.median(recent))

    grid_median_pace = statistics.median(all_raw_paces) if all_raw_paces else DEFAULT_BASE_PACE

    for idx, d in enumerate(current_positions):
        driver_num = int(d.get("driver_number", idx + 1))
        driver_name = str(d.get("driver_name", f"Driver {driver_num}"))
        team = str(d.get("team") or d.get("team_name") or "Independent")
        curr_pos = int(d.get("current_position") or d.get("position") or (idx + 1))

        # Tyre state
        tyre_age = max(0, tyre_ages.get(driver_num, 0))
        raw_compound = compounds.get(driver_num, DEFAULT_COMPOUND)
        compound = (raw_compound or DEFAULT_COMPOUND).strip().upper()
        prop = COMPOUND_PROPERTIES.get(compound, COMPOUND_PROPERTIES[DEFAULT_COMPOUND])
        deg_rate = prop["deg_rate"]
        max_life = prop["max_life"]

        # Base pace calculation
        d_laps = lap_times.get(driver_num, [])
        valid_laps = _clean_lap_times(d_laps)
        clean_laps = _filter_lap_outliers(valid_laps)

        if clean_laps:
            recent_laps = clean_laps[-5:]
            raw_pace = statistics.median(recent_laps)
            # Consistency measure (stdev of clean laps)
            pace_variance = statistics.stdev(clean_laps) if len(clean_laps) >= 2 else 0.50
        else:
            raw_pace = grid_median_pace + (curr_pos - 1) * 0.15
            pace_variance = 1.0

        # Fuel-corrected base pace: pace at tyre age 0 with baseline fuel
        # raw_pace = base_pace + deg_rate * tyre_age - fuel_effect * current_lap
        base_pace = raw_pace - (deg_rate * tyre_age) + (FUEL_BURN_EFFECT_SEC_PER_LAP * current_lap)

        # Initial interval / gap to leader at current lap
        if "gap_to_leader" in d and d["gap_to_leader"] is not None:
            try:
                initial_gap = float(d["gap_to_leader"])
            except (ValueError, TypeError):
                initial_gap = (curr_pos - 1) * 1.5
        elif "interval" in d and d["interval"] is not None:
            try:
                initial_gap = float(d["interval"])
            except (ValueError, TypeError):
                initial_gap = (curr_pos - 1) * 1.5
        else:
            # Estimate reasonable interval spacing if not explicitly provided
            initial_gap = (curr_pos - 1) * 1.5

        # Phase 2: Lap-by-lap simulation for remaining distance
        projected_remaining_time = 0.0
        current_sim_age = tyre_age
        current_sim_compound = compound
        current_sim_deg = deg_rate
        current_sim_max_life = max_life
        projected_pit_stops = 0

        for lap in range(current_lap + 1, total_laps + 1):
            is_pit_lap = False

            # Pit stop trigger: tyre reaches compound limit before race finish
            if current_sim_age >= current_sim_max_life and lap < total_laps:
                is_pit_lap = True

            if is_pit_lap:
                projected_pit_stops += 1
                # Add pit stop time penalty
                projected_remaining_time += pit_loss_time
                # Switch compound
                next_c = COMPOUND_PROPERTIES.get(
                    current_sim_compound, COMPOUND_PROPERTIES[DEFAULT_COMPOUND]
                )["next_compound"]
                current_sim_compound = next_c
                new_prop = COMPOUND_PROPERTIES.get(next_c, COMPOUND_PROPERTIES[DEFAULT_COMPOUND])
                current_sim_deg = new_prop["deg_rate"]
                current_sim_max_life = new_prop["max_life"]
                current_sim_age = 0

            # Lap pace: base pace + degradation - fuel burn effect
            lap_pace = (
                base_pace
                + (current_sim_deg * current_sim_age)
                - (FUEL_BURN_EFFECT_SEC_PER_LAP * lap)
            )
            projected_remaining_time += lap_pace
            current_sim_age += 1

        projected_total_time = initial_gap + projected_remaining_time

        driver_sim_profiles.append({
            "driver_number": driver_num,
            "driver_name": driver_name,
            "team": team,
            "current_position": curr_pos,
            "projected_total_time": projected_total_time,
            "projected_pit_stops": projected_pit_stops,
            "pace_variance": pace_variance,
            "initial_gap": initial_gap,
        })

    # Phase 3: Sort drivers by projected total time
    driver_sim_profiles.sort(key=lambda x: (x["projected_total_time"], x["current_position"]))

    n_drivers = len(driver_sim_profiles)
    results: list[dict[str, Any]] = []

    # Phase 4: Compute final rankings, position deltas, and confidence scores
    for rank_idx, profile in enumerate(driver_sim_profiles):
        predicted_pos = rank_idx + 1
        pos_delta = profile["current_position"] - predicted_pos

        # Confidence calculation
        if remaining_laps == 0:
            confidence = 1.0
        else:
            # 1. Lap completion progression factor (confidence rises as laps remaining decreases)
            f_laps = 1.0 - 0.40 * (remaining_laps / max(1, total_laps))

            # 2. Driver lap consistency factor (lower variance -> higher confidence)
            f_consistency = 1.0 - min(0.25, profile["pace_variance"] / 4.0)

            # 3. Time margin to adjacent competitor
            if n_drivers == 1:
                f_margin = 1.0
            else:
                curr_time = profile["projected_total_time"]
                margins: list[float] = []
                if rank_idx > 0:
                    margins.append(abs(curr_time - driver_sim_profiles[rank_idx - 1]["projected_total_time"]))
                if rank_idx < n_drivers - 1:
                    margins.append(abs(curr_time - driver_sim_profiles[rank_idx + 1]["projected_total_time"]))
                nearest_margin = min(margins) if margins else 5.0

                # When drivers are within 1.0 second of each other, outcome is volatile
                if nearest_margin < 1.0:
                    f_margin = 0.50 + 0.40 * max(0.0, nearest_margin)
                elif nearest_margin < 3.0:
                    f_margin = 0.90 + 0.10 * ((nearest_margin - 1.0) / 2.0)
                else:
                    f_margin = 1.0

            raw_confidence = f_laps * f_consistency * f_margin
            confidence = round(max(0.15, min(0.99, raw_confidence)), 4)

        results.append({
            "predicted_position": predicted_pos,
            "driver_number": profile["driver_number"],
            "driver_name": profile["driver_name"],
            "team": profile["team"],
            "current_position": profile["current_position"],
            "position_delta": pos_delta,
            "projected_total_time": round(float(profile["projected_total_time"]), 3),
            "confidence_score": float(confidence),
            "projected_pit_stops": int(profile["projected_pit_stops"]),
        })

    return results
