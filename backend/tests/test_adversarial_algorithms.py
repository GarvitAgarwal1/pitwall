"""Adversarial Strategy Algorithms Stress Test Suite (Tier 5 White-Box).

Exhaustively verifies mathematical invariants, numerical stability, zero-division
resistance, and extreme boundary conditions for:
  - services/pit_window.py (calculate_pit_window)
  - services/race_predictor.py (predict_race_result)
"""

from __future__ import annotations

import math
from typing import Any
import pytest

from app.services.pit_window import calculate_pit_window, COMPOUND_BASELINES
from app.services.race_predictor import predict_race_result, COMPOUND_PROPERTIES


# ==============================================================================
# Invariant Validation Helpers
# ==============================================================================

REQUIRED_PIT_WINDOW_KEYS = {
    "degradation_rate",
    "cliff_lap",
    "laps_until_cliff",
    "earliest_pit_lap",
    "latest_pit_lap",
    "recommended_pit_lap",
    "undercut_status",
    "undercut_gap_delta",
    "pit_loss_time",
    "compound",
}

REQUIRED_PREDICTOR_KEYS = {
    "predicted_position",
    "driver_number",
    "driver_name",
    "team",
    "current_position",
    "position_delta",
    "projected_total_time",
    "confidence_score",
    "projected_pit_stops",
}


def assert_pit_window_invariants(res: dict[str, Any], allow_inf_loss: bool = False) -> None:
    """Validate all mathematical invariants for pit window detection."""
    # 1. Key presence
    missing = REQUIRED_PIT_WINDOW_KEYS - set(res.keys())
    assert not missing, f"Missing required keys in pit_window response: {missing}"

    # 2. Window bounds ordering: earliest <= recommended <= latest
    earliest = res["earliest_pit_lap"]
    recommended = res["recommended_pit_lap"]
    latest = res["latest_pit_lap"]
    assert earliest <= recommended, (
        f"Ordering violation: earliest_pit_lap ({earliest}) > recommended_pit_lap ({recommended})"
    )
    assert recommended <= latest, (
        f"Ordering violation: recommended_pit_lap ({recommended}) > latest_pit_lap ({latest})"
    )

    # 3. Positivity & non-negativity
    assert res["earliest_pit_lap"] >= 1, f"earliest_pit_lap must be >= 1, got {earliest}"
    assert res["cliff_lap"] >= 1, f"cliff_lap must be >= 1, got {res['cliff_lap']}"
    assert res["laps_until_cliff"] >= 0, f"laps_until_cliff must be >= 0, got {res['laps_until_cliff']}"
    assert res["degradation_rate"] >= 0.0, f"degradation_rate must be >= 0.0, got {res['degradation_rate']}"

    # 4. Undercut status valid enum
    assert res["undercut_status"] in ("viable", "marginal", "not_viable"), (
        f"Invalid undercut_status: {res['undercut_status']}"
    )

    # 5. Numerical stability: No NaNs anywhere
    for key, val in res.items():
        if isinstance(val, (int, float)):
            assert not math.isnan(val), f"NaN detected in key '{key}'"
            if not allow_inf_loss or key != "pit_loss_time":
                assert not math.isinf(val), f"Infinite value detected in key '{key}'"


def assert_race_predictor_invariants(
    results: list[dict[str, Any]],
    n_expected_drivers: int,
    allow_inf_time: bool = False,
) -> None:
    """Validate all mathematical invariants for race result prediction."""
    assert len(results) == n_expected_drivers, (
        f"Expected {n_expected_drivers} predictions, got {len(results)}"
    )

    if n_expected_drivers == 0:
        return

    predicted_positions: list[int] = []
    driver_numbers: list[int] = []

    for idx, r in enumerate(results):
        # 1. Key presence
        missing = REQUIRED_PREDICTOR_KEYS - set(r.keys())
        assert not missing, f"Missing required keys in prediction record: {missing}"

        # 2. Valid position and driver tracking
        predicted_positions.append(r["predicted_position"])
        driver_numbers.append(r["driver_number"])

        # 3. Position delta consistency: current_pos - predicted_pos
        expected_delta = r["current_position"] - r["predicted_position"]
        assert r["position_delta"] == expected_delta, (
            f"position_delta mismatch: got {r['position_delta']}, expected {expected_delta}"
        )

        # 4. Confidence score strictly bounded in [0.0, 1.0]
        conf = r["confidence_score"]
        assert not math.isnan(conf), f"Driver {r['driver_number']} has NaN confidence score"
        assert not math.isinf(conf), f"Driver {r['driver_number']} has Infinite confidence score"
        assert 0.0 <= conf <= 1.0, (
            f"Confidence score {conf} out of bounds [0.0, 1.0] for driver {r['driver_number']}"
        )

        # 5. Projected total time numerical stability
        ptime = r["projected_total_time"]
        assert not math.isnan(ptime), f"Driver {r['driver_number']} has NaN projected_total_time"
        if not allow_inf_time:
            assert not math.isinf(ptime), f"Driver {r['driver_number']} has Infinite projected_total_time"
        assert ptime > 0 or ptime == 0.0, f"Negative projected_total_time: {ptime}"

    # 6. Valid permutation: 1..N without duplicates or holes
    assert sorted(predicted_positions) == list(range(1, n_expected_drivers + 1)), (
        f"Predicted positions do not form a valid 1..N permutation: {predicted_positions}"
    )
    assert len(set(driver_numbers)) == n_expected_drivers, (
        f"Duplicate driver numbers in predictions: {driver_numbers}"
    )

    # 7. Monotonic ordering of projected total time
    for i in range(len(results) - 1):
        t_curr = results[i]["projected_total_time"]
        t_next = results[i + 1]["projected_total_time"]
        assert t_curr <= t_next or math.isclose(t_curr, t_next), (
            f"Ranking inversion: driver at rank {i+1} time {t_curr} > rank {i+2} time {t_next}"
        )


# ==============================================================================
# SECTION 1: calculate_pit_window Adversarial Stress Tests
# ==============================================================================

class TestPitWindowAdversarialInputs:
    """Stress tests covering extreme, adversarial, and boundary inputs to calculate_pit_window."""

    def test_single_lap_time(self):
        """Single lap time: Insufficient for linear regression; must fall back gracefully to baseline."""
        res = calculate_pit_window(
            tyre_age=12,
            lap_times=[88.42],
            gap_ahead=1.5,
            gap_behind=3.0,
            remaining_laps=25,
            compound="MEDIUM",
        )
        assert_pit_window_invariants(res)
        # Should fall back to MEDIUM baseline degradation (0.075)
        assert res["degradation_rate"] == 0.075
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_zero_lap_times(self):
        """Zero lap times: Completely empty history; must fall back to compound baseline without crashing."""
        res = calculate_pit_window(
            tyre_age=5,
            lap_times=[],
            gap_ahead=2.0,
            gap_behind=4.0,
            remaining_laps=30,
            compound="HARD",
        )
        assert_pit_window_invariants(res)
        assert res["degradation_rate"] == 0.045  # HARD baseline
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_1000_lap_times_stress(self):
        """1000 lap times: Very large dataset; regression must execute reliably and rapidly."""
        large_laps = [80.0 + 0.02 * i for i in range(1000)]
        res = calculate_pit_window(
            tyre_age=15,
            lap_times=large_laps,
            gap_ahead=1.2,
            gap_behind=2.5,
            remaining_laps=40,
            compound="MEDIUM",
        )
        assert_pit_window_invariants(res)
        assert res["degradation_rate"] > 0
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_identical_lap_times_zero_variance(self):
        """Identical lap times (variance = 0): Zero variance in y, tests regression stability."""
        identical_laps = [90.500] * 25
        res = calculate_pit_window(
            tyre_age=10,
            lap_times=identical_laps,
            gap_ahead=1.0,
            gap_behind=2.0,
            remaining_laps=20,
            compound="SOFT",
        )
        assert_pit_window_invariants(res)
        # Identical lap times yield slope = 0.0, which clamps to MIN_DEGRADATION_RATE (0.020)
        assert res["degradation_rate"] == 0.020
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_inverse_degradation_faster_laps(self):
        """Inverse degradation (lap times getting faster): Negative slope due to fuel burn / track evolution."""
        faster_laps = [95.0 - 0.25 * i for i in range(15)]
        res = calculate_pit_window(
            tyre_age=14,
            lap_times=faster_laps,
            gap_ahead=3.0,
            gap_behind=1.5,
            remaining_laps=35,
            compound="MEDIUM",
        )
        assert_pit_window_invariants(res)
        # Negative slope should clamp to MIN_DEGRADATION_RATE (0.020)
        assert res["degradation_rate"] == 0.020
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_extreme_degradation_high_wear(self):
        """Extreme degradation (+5.0s/lap): Catastrophic tyre degradation scenario."""
        catastrophic_laps = [80.0 + 5.0 * i for i in range(8)]
        res = calculate_pit_window(
            tyre_age=8,
            lap_times=catastrophic_laps,
            gap_ahead=1.5,
            gap_behind=2.0,
            remaining_laps=25,
            compound="SOFT",
        )
        assert_pit_window_invariants(res)
        # Degradation rate should capture the high slope
        assert res["degradation_rate"] >= 4.0
        # Dynamic cliff lap is heavily brought forward, but bounded by compound min_cliff_bound
        assert res["cliff_lap"] <= 20
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    @pytest.mark.parametrize("compound,extreme_age", [
        ("SOFT", 60),
        ("MEDIUM", 80),
        ("HARD", 100),
        ("INTERMEDIATE", 55),
        ("WET", 75),
    ])
    def test_tyre_age_way_past_cliff(self, compound: str, extreme_age: int):
        """Tyre age already far past the expected cliff lap."""
        res = calculate_pit_window(
            tyre_age=extreme_age,
            lap_times=[92.0 + 0.1 * i for i in range(5)],
            gap_ahead=2.0,
            gap_behind=5.0,
            remaining_laps=15,
            compound=compound,
            current_lap=extreme_age,
        )
        assert_pit_window_invariants(res)
        # Laps until cliff must clamp to 0
        assert res["laps_until_cliff"] == 0
        # Pit window bounds must still maintain order
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]
        # Recommended pit lap must not precede earliest pit lap
        assert res["recommended_pit_lap"] >= res["earliest_pit_lap"]

    def test_negative_gaps(self):
        """Negative gaps (e.g. leader or invalid telemetry): gap_ahead=-5.0, gap_behind=-10.0."""
        res = calculate_pit_window(
            tyre_age=16,
            lap_times=[87.0, 87.1, 87.2, 87.3],
            gap_ahead=-5.0,
            gap_behind=-10.0,
            remaining_laps=20,
            compound="HARD",
        )
        assert_pit_window_invariants(res)
        # Undercut must be not_viable when gap_ahead is non-positive
        assert res["undercut_status"] == "not_viable"
        assert res["undercut_gap_delta"] == 0.0
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_zero_remaining_laps(self):
        """Zero remaining laps: Race has already completed; pit window should collapse to current lap."""
        res = calculate_pit_window(
            tyre_age=25,
            lap_times=[89.0, 89.1, 89.2],
            gap_ahead=1.0,
            gap_behind=2.0,
            remaining_laps=0,
            compound="MEDIUM",
            current_lap=57,
        )
        assert_pit_window_invariants(res)
        # Earliest, latest, and recommended pit laps must all collapse to current lap
        assert res["earliest_pit_lap"] == 57
        assert res["latest_pit_lap"] == 57
        assert res["recommended_pit_lap"] == 57
        assert res["undercut_status"] == "not_viable"
        assert res["undercut_gap_delta"] == 0.0

    def test_infinite_pit_loss_time(self):
        """Infinite pit loss time: e.g. pit lane closed or simulator infinite barrier."""
        res = calculate_pit_window(
            tyre_age=10,
            lap_times=[85.0, 85.1, 85.2],
            gap_ahead=1.5,
            gap_behind=3.0,
            remaining_laps=20,
            pit_loss_time=float("inf"),
            compound="SOFT",
        )
        assert_pit_window_invariants(res, allow_inf_loss=True)
        # Window bounds must still hold
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]
        assert not math.isnan(res["pit_loss_time"])

    def test_nan_pit_loss_time(self):
        """NaN pit loss time: Telemetry sensor failure providing NaN."""
        res = calculate_pit_window(
            tyre_age=10,
            lap_times=[85.0, 85.1, 85.2],
            gap_ahead=1.5,
            gap_behind=3.0,
            remaining_laps=20,
            pit_loss_time=float("nan"),
            compound="SOFT",
        )
        # NaN is sanitized via max(0.0, ...) to 0.0
        assert_pit_window_invariants(res, allow_inf_loss=False)
        assert not math.isnan(res["pit_loss_time"])
        assert res["pit_loss_time"] == 0.0
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_corrupted_lap_times_with_nans_and_negatives(self):
        """Lap times array containing None, NaN, negative values, and extreme outliers."""
        dirty_laps = [float("nan"), -90.0, 0.0, 88.0, 88.1, 88.2, 88.3, 250.0, None]
        res = calculate_pit_window(
            tyre_age=12,
            lap_times=dirty_laps,  # type: ignore
            gap_ahead=1.0,
            gap_behind=2.0,
            remaining_laps=25,
            compound="MEDIUM",
        )
        assert_pit_window_invariants(res)
        assert res["degradation_rate"] > 0
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_unknown_compound_fallback(self):
        """Unknown or malformed tyre compound string."""
        res = calculate_pit_window(
            tyre_age=15,
            lap_times=[90.0, 90.1, 90.2],
            gap_ahead=1.5,
            gap_behind=2.0,
            remaining_laps=20,
            compound="SUPER_HYPER_SOFT_INVALID",
        )
        assert_pit_window_invariants(res)
        assert res["compound"] == "SUPER_HYPER_SOFT_INVALID"
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]

    def test_final_lap_single_remaining(self):
        """Boundary condition: Exactly 1 remaining lap."""
        res = calculate_pit_window(
            tyre_age=30,
            lap_times=[88.0, 88.2, 88.4],
            gap_ahead=0.8,
            gap_behind=2.0,
            remaining_laps=1,
            compound="HARD",
            current_lap=56,
        )
        assert_pit_window_invariants(res)
        # On final lap (remaining_laps == 1), undercut is not viable
        assert res["undercut_status"] == "not_viable"
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]


# ==============================================================================
# SECTION 2: predict_race_result Adversarial Stress Tests
# ==============================================================================

class TestRacePredictorAdversarialInputs:
    """Stress tests covering extreme, adversarial, and boundary inputs to predict_race_result."""

    def test_single_driver_race(self):
        """Single driver race: Solo car on track; margin calculation must handle lack of adjacent cars."""
        positions = [{
            "driver_number": 1,
            "driver_name": "Max Verstappen",
            "team": "Red Bull Racing",
            "current_position": 1,
            "gap_to_leader": 0.0,
        }]
        tyres = {1: 15}
        compounds = {1: "MEDIUM"}
        laps = {1: [85.0, 85.1, 85.2, 85.3]}

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=20,
            total_laps=50,
        )
        assert_race_predictor_invariants(results, 1)
        assert results[0]["predicted_position"] == 1
        assert results[0]["position_delta"] == 0
        assert 0.0 <= results[0]["confidence_score"] <= 1.0

    def test_24_drivers_race(self):
        """24 drivers race: Expanded modern grid size; validates full permutation scaling."""
        positions = []
        tyres = {}
        compounds = {}
        laps = {}

        for i in range(1, 25):
            positions.append({
                "driver_number": i,
                "driver_name": f"Driver {i:02d}",
                "team": f"Team {(i - 1) // 2 + 1}",
                "current_position": i,
                "gap_to_leader": (i - 1) * 2.5,
            })
            tyres[i] = (i * 3) % 25
            compounds[i] = ["SOFT", "MEDIUM", "HARD"][i % 3]
            base_p = 85.0 + i * 0.1
            laps[i] = [base_p + 0.05 * k for k in range(8)]

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=25,
            total_laps=60,
        )
        assert_race_predictor_invariants(results, 24)

    def test_all_drivers_identical_lap_times_and_gaps(self):
        """All drivers identical lap times and identical gaps (gap = 0.0).

        Tests:
        - Deterministic tie-breaking by current_position.
        - Zero margin between cars (margin = 0.0) without ZeroDivisionError.
        - Valid 1..N permutation.
        """
        n_drivers = 10
        positions = [
            {
                "driver_number": i,
                "driver_name": f"Driver {i}",
                "team": f"Team {i}",
                "current_position": i,
                "gap_to_leader": 0.0,
            }
            for i in range(1, n_drivers + 1)
        ]
        tyres = {i: 10 for i in range(1, n_drivers + 1)}
        compounds = {i: "MEDIUM" for i in range(1, n_drivers + 1)}
        laps = {i: [88.0, 88.0, 88.0, 88.0] for i in range(1, n_drivers + 1)}

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=15,
            total_laps=50,
        )
        assert_race_predictor_invariants(results, n_drivers)
        # Tie-breaker should preserve initial order
        for idx, r in enumerate(results):
            assert r["predicted_position"] == idx + 1
            assert r["driver_number"] == idx + 1
            # In a dead heat (margin=0.0), confidence should reflect tight battle
            assert 0.0 <= r["confidence_score"] <= 1.0

    def test_extreme_lap_disparity_0_vs_70_laps(self):
        """One driver with 0 laps tyre age, another with 70 laps tyre age in a 70 lap race."""
        positions = [
            {
                "driver_number": 1,
                "driver_name": "Fresh Tyres",
                "team": "Team A",
                "current_position": 2,
                "gap_to_leader": 5.0,
            },
            {
                "driver_number": 2,
                "driver_name": "Ancient Tyres",
                "team": "Team B",
                "current_position": 1,
                "gap_to_leader": 0.0,
            },
        ]
        # Driver 1 has 0 laps on Hard, Driver 2 has 70 laps on Soft
        tyres = {1: 0, 2: 70}
        compounds = {1: "HARD", 2: "SOFT"}
        laps = {
            1: [84.0, 84.1, 84.0],
            2: [92.0, 92.5, 93.0],
        }

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=40,
            total_laps=70,
        )
        assert_race_predictor_invariants(results, 2)
        # Fresh tyres driver should easily overtake the driver on 70-lap Softs
        assert results[0]["driver_number"] == 1
        assert results[0]["predicted_position"] == 1
        assert results[1]["driver_number"] == 2
        assert results[1]["predicted_position"] == 2

    def test_final_lap_of_race_boundary(self):
        """Final lap of the race: current_lap == total_laps - 1."""
        positions = [
            {"driver_number": 1, "driver_name": "Leader", "team": "Red", "current_position": 1, "gap_to_leader": 0.0},
            {"driver_number": 2, "driver_name": "Chaser", "team": "Blue", "current_position": 2, "gap_to_leader": 0.3},
        ]
        tyres = {1: 25, 2: 12}
        compounds = {1: "HARD", 2: "SOFT"}
        laps = {
            1: [86.5, 86.6],
            2: [85.2, 85.1],
        }

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=56,
            total_laps=57,
        )
        assert_race_predictor_invariants(results, 2)
        # Confidence should be elevated due to remaining_laps = 1
        assert results[0]["confidence_score"] >= 0.50

    def test_race_already_completed(self):
        """Current lap == total_laps: Race is over; confidence must be 1.0."""
        positions = [
            {"driver_number": 1, "driver_name": "Winner", "team": "Red", "current_position": 1, "gap_to_leader": 0.0},
            {"driver_number": 2, "driver_name": "Second", "team": "Blue", "current_position": 2, "gap_to_leader": 4.5},
        ]
        results = predict_race_result(
            current_positions=positions,
            tyre_ages={1: 25, 2: 25},
            compounds={1: "MEDIUM", 2: "MEDIUM"},
            lap_times={1: [85.0], 2: [85.5]},
            current_lap=57,
            total_laps=57,
        )
        assert_race_predictor_invariants(results, 2)
        assert results[0]["confidence_score"] == 1.0
        assert results[1]["confidence_score"] == 1.0
        assert results[0]["predicted_position"] == 1
        assert results[1]["predicted_position"] == 2

    def test_leader_2_laps_ahead_of_field(self):
        """Leader is massive 2 laps (~180 seconds) ahead of the field."""
        positions = [
            {"driver_number": 1, "driver_name": "Leader", "team": "Dominant", "current_position": 1, "gap_to_leader": 0.0},
            {"driver_number": 2, "driver_name": "P2 Car", "team": "Rival", "current_position": 2, "gap_to_leader": 185.0},
            {"driver_number": 3, "driver_name": "P3 Car", "team": "Midfield", "current_position": 3, "gap_to_leader": 190.0},
        ]
        tyres = {1: 15, 2: 15, 3: 15}
        compounds = {1: "MEDIUM", 2: "MEDIUM", 3: "MEDIUM"}
        laps = {
            1: [85.0, 85.0, 85.1],
            2: [86.0, 86.0, 86.1],
            3: [87.0, 87.0, 87.1],
        }

        results = predict_race_result(
            current_positions=positions,
            tyre_ages=tyres,
            compounds=compounds,
            lap_times=laps,
            current_lap=30,
            total_laps=50,
        )
        assert_race_predictor_invariants(results, 3)
        assert results[0]["driver_number"] == 1
        assert results[0]["predicted_position"] == 1
        # Leader confidence should be very high due to huge time buffer
        assert results[0]["confidence_score"] > 0.80

    def test_completely_empty_lap_time_histories(self):
        """All drivers have completely empty lap time histories: tests grid median fallback."""
        positions = [
            {"driver_number": 44, "driver_name": "Driver 44", "team": "Team A", "current_position": 1, "gap_to_leader": 0.0},
            {"driver_number": 63, "driver_name": "Driver 63", "team": "Team A", "current_position": 2, "gap_to_leader": 2.0},
            {"driver_number": 16, "driver_name": "Driver 16", "team": "Team B", "current_position": 3, "gap_to_leader": 5.0},
        ]
        results = predict_race_result(
            current_positions=positions,
            tyre_ages={44: 10, 63: 10, 16: 10},
            compounds={44: "HARD", 63: "HARD", 16: "HARD"},
            lap_times={},  # Empty dict
            current_lap=10,
            total_laps=50,
        )
        assert_race_predictor_invariants(results, 3)
        # All required keys must be present and valid
        for r in results:
            assert r["projected_total_time"] > 0
            assert 0.0 <= r["confidence_score"] <= 1.0

    def test_empty_current_positions_returns_empty_list(self):
        """Empty current positions list returns an empty list without error."""
        results = predict_race_result(
            current_positions=[],
            tyre_ages={},
            compounds={},
            lap_times={},
            current_lap=10,
            total_laps=50,
        )
        assert results == []

    def test_malformed_driver_fields_handled_gracefully(self):
        """Driver dicts missing optional fields or containing string numbers."""
        positions = [
            {"current_position": "1", "driver_number": "55"},
            {"current_position": 2},  # Missing driver_number, name, team
        ]
        results = predict_race_result(
            current_positions=positions,
            tyre_ages={},
            compounds={},
            lap_times={},
            current_lap=10,
            total_laps=40,
        )
        assert_race_predictor_invariants(results, 2)
        assert results[0]["driver_number"] == 55
        assert results[1]["driver_number"] == 2
