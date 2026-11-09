"""Pit Window Detection and Strategy Optimization Service.

Calculates tyre degradation rates via linear regression, estimates tyre cliff
laps based on compound wear models, computes pit window bounds (earliest, latest,
recommended), and evaluates undercut/overcut viability.
"""

from __future__ import annotations

import math
from typing import Any

# Compound baseline characteristics
# deg_rate: baseline degradation in seconds per lap
# cliff_lap: typical maximum useful life in laps before severe pace loss (>0.3s drop)
# fresh_delta: expected pace advantage on fresh rubber during out-lap (seconds)
COMPOUND_BASELINES: dict[str, dict[str, float]] = {
    "SOFT": {
        "deg_rate": 0.120,
        "cliff_lap": 20.0,
        "fresh_delta": 2.0,
        "min_stint": 8.0,
    },
    "MEDIUM": {
        "deg_rate": 0.075,
        "cliff_lap": 28.0,
        "fresh_delta": 1.6,
        "min_stint": 10.0,
    },
    "HARD": {
        "deg_rate": 0.045,
        "cliff_lap": 40.0,
        "fresh_delta": 1.2,
        "min_stint": 12.0,
    },
    "INTERMEDIATE": {
        "deg_rate": 0.090,
        "cliff_lap": 25.0,
        "fresh_delta": 1.5,
        "min_stint": 8.0,
    },
    "WET": {
        "deg_rate": 0.080,
        "cliff_lap": 35.0,
        "fresh_delta": 1.3,
        "min_stint": 10.0,
    },
}

DEFAULT_COMPOUND = "MEDIUM"
MIN_DEGRADATION_RATE = 0.020  # Minimum clamp for irreversible thermal degradation


def calculate_pit_window(
    tyre_age: int,
    lap_times: list[float],
    gap_ahead: float,
    gap_behind: float,
    remaining_laps: int,
    pit_loss_time: float = 22.0,
    compound: str = "MEDIUM",
    current_lap: int | None = None,
) -> dict[str, Any]:
    """Calculate the pit window, degradation rate, tyre cliff, and undercut viability.

    Args:
        tyre_age: Current age of tyres in laps (>= 0).
        lap_times: Sequence of recent lap times in seconds.
        gap_ahead: Time gap in seconds to the car ahead (positive float, or <= 0 if leading/none).
        gap_behind: Time gap in seconds to the car behind.
        remaining_laps: Laps remaining until scheduled race finish.
        pit_loss_time: Stationary + lane transit delta in seconds (default 22.0s).
        compound: Tyre compound name ('SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET').
        current_lap: Optional current race lap. If omitted, estimated from tyre_age.

    Returns:
        dict containing:
            - degradation_rate: float (sec/lap, rounded to 4 decimals)
            - cliff_lap: int (lap age when cliff occurs)
            - laps_until_cliff: int (remaining laps on this set until cliff)
            - earliest_pit_lap: int
            - latest_pit_lap: int
            - recommended_pit_lap: int
            - undercut_status: str ("viable" | "marginal" | "not_viable")
            - undercut_gap_delta: float (projected advantage/loss in seconds)
            - pit_loss_time: float
            - compound: str
    """
    # 1. Normalize compound and extract baselines
    normalized_compound = (compound or DEFAULT_COMPOUND).strip().upper()
    baseline = COMPOUND_BASELINES.get(normalized_compound, COMPOUND_BASELINES[DEFAULT_COMPOUND])
    base_deg = baseline["deg_rate"]
    base_cliff = int(baseline["cliff_lap"])
    fresh_tyre_delta = baseline["fresh_delta"]
    min_stint = int(baseline["min_stint"])

    # Sanitize inputs
    tyre_age = max(0, int(tyre_age))
    remaining_laps = max(0, int(remaining_laps))
    pit_loss_time = max(0.0, float(pit_loss_time))
    effective_current_lap = max(1, int(current_lap)) if current_lap is not None else max(1, tyre_age)
    total_laps = effective_current_lap + remaining_laps

    # 2. Outlier filtering and clean lap extraction
    valid_laps: list[float] = [
        float(t) for t in lap_times if isinstance(t, (int, float)) and not math.isnan(t) and t > 0
    ]

    clean_laps: list[float] = []
    if len(valid_laps) >= 3:
        sorted_laps = sorted(valid_laps)
        n_laps = len(sorted_laps)
        median_time = (
            sorted_laps[n_laps // 2]
            if n_laps % 2 != 0
            else (sorted_laps[n_laps // 2 - 1] + sorted_laps[n_laps // 2]) / 2.0
        )
        # Keep laps within 85% to 108% of median pace (filtering SC, VSC, in/out laps)
        clean_laps = [t for t in valid_laps if 0.85 * median_time <= t <= 1.08 * median_time]
    elif len(valid_laps) >= 2:
        clean_laps = valid_laps.copy()

    # 3. Compute degradation rate via linear regression
    # slope = cov(x, y) / var(x) where x is lap index [0..k-1], y is lap time
    if len(clean_laps) >= 3:
        k = len(clean_laps)
        x_mean = (k - 1) / 2.0
        y_mean = sum(clean_laps) / k
        cov_xy = sum((i - x_mean) * (clean_laps[i] - y_mean) for i in range(k))
        var_x = sum((i - x_mean) ** 2 for i in range(k))
        if var_x > 0:
            raw_slope = cov_xy / var_x
        else:
            raw_slope = base_deg

        # If degradation is negative (track evolution / fuel effect masking wear)
        # or negligible (< 0.01), clamp to baseline minimum (0.020 s/lap)
        if raw_slope < 0.01:
            degradation_rate = MIN_DEGRADATION_RATE
        else:
            degradation_rate = raw_slope
    else:
        # Fallback to compound baseline when insufficient clean laps exist
        degradation_rate = base_deg

    # 4. Tyre cliff estimation
    # As tyres degrade, cliff lap adjusts dynamically
    cliff_ratio = base_deg / max(degradation_rate, MIN_DEGRADATION_RATE)
    dynamic_cliff = round(base_cliff * cliff_ratio)
    # Bound estimated cliff between reasonable compound limits
    min_cliff_bound = max(1, base_cliff - 8)
    max_cliff_bound = base_cliff + 10
    cliff_lap = max(min_cliff_bound, min(dynamic_cliff, max_cliff_bound))
    laps_until_cliff = max(0, cliff_lap - tyre_age)

    # 5. Pit window boundaries
    if remaining_laps == 0:
        # Race is already complete
        earliest_pit_lap = effective_current_lap
        latest_pit_lap = effective_current_lap
        recommended_pit_lap = effective_current_lap
        undercut_status = "not_viable"
        undercut_gap_delta = 0.0
    else:
        # Earliest pit lap: minimum stint completion or immediate stop if stint already mature
        if tyre_age < min_stint:
            earliest_lap_candidate = effective_current_lap + (min_stint - tyre_age)
        else:
            earliest_lap_candidate = effective_current_lap + 1

        # Clamp latest pit lap to total laps - 1 (or total laps if 1 lap left)
        max_viable_lap = max(effective_current_lap, total_laps - 1)
        earliest_pit_lap = max(effective_current_lap, min(earliest_lap_candidate, max_viable_lap))
        latest_pit_lap = max(
            earliest_pit_lap,
            min(effective_current_lap + laps_until_cliff, max_viable_lap),
        )

        # 6. Undercut viability analysis
        # Evaluates undercut against car ahead (gap_ahead)
        if gap_ahead is not None and gap_ahead > 0 and remaining_laps > 1:
            # Undercut opportunity exists
            viable_threshold = fresh_tyre_delta * 1.2
            marginal_threshold = fresh_tyre_delta * 1.8

            if gap_ahead < viable_threshold:
                undercut_status = "viable"
            elif gap_ahead < marginal_threshold:
                undercut_status = "marginal"
            else:
                undercut_status = "not_viable"

            # Projected net gap delta: fresh tyre pace advantage minus current gap
            undercut_gap_delta = round(fresh_tyre_delta - gap_ahead, 4)
        else:
            undercut_status = "not_viable"
            undercut_gap_delta = 0.0

        # Recommended pit lap selection:
        # If undercut is viable, pit as early as possible to capture track position.
        # Otherwise, extend toward cliff lap minus safety margin (e.g. 2 laps before cliff).
        if undercut_status == "viable":
            recommended_pit_lap = earliest_pit_lap
        else:
            target_optimal = max(earliest_pit_lap, effective_current_lap + max(1, laps_until_cliff - 2))
            recommended_pit_lap = min(latest_pit_lap, target_optimal)

    return {
        "degradation_rate": round(float(degradation_rate), 4),
        "cliff_lap": int(cliff_lap),
        "laps_until_cliff": int(laps_until_cliff),
        "earliest_pit_lap": int(earliest_pit_lap),
        "latest_pit_lap": int(latest_pit_lap),
        "recommended_pit_lap": int(recommended_pit_lap),
        "undercut_status": undercut_status,
        "undercut_gap_delta": float(undercut_gap_delta),
        "pit_loss_time": round(float(pit_loss_time), 2),
        "compound": normalized_compound,
    }
