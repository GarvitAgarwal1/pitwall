"""Unit tests for Race Result Predictor algorithm."""

from __future__ import annotations

try:
    from backend.app.services.race_predictor import predict_race_result
except ModuleNotFoundError:
    from app.services.race_predictor import predict_race_result


def test_predicted_finishing_order_clear_pace_advantage() -> None:
    """Verify a faster car behind overcomes an initial gap to finish ahead."""
    current_positions = [
        {"driver_number": 16, "driver_name": "Charles Leclerc", "team": "Ferrari", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull Racing", "position": 2, "gap_to_leader": 2.0},
    ]
    tyre_ages = {16: 15, 1: 5}
    compounds = {16: "MEDIUM", 1: "HARD"}
    # Verstappen is significantly faster (88.5s vs 90.5s)
    lap_times = {
        16: [90.5, 90.6, 90.5, 90.7, 90.6],
        1: [88.5, 88.6, 88.5, 88.4, 88.5],
    }

    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=20,
        total_laps=50,
    )

    assert len(results) == 2
    # Verstappen should be predicted P1
    assert results[0]["driver_number"] == 1
    assert results[0]["predicted_position"] == 1
    assert results[0]["position_delta"] == 1  # Started P2, finishes P1 (+1 gain)

    # Leclerc should be predicted P2
    assert results[1]["driver_number"] == 16
    assert results[1]["predicted_position"] == 2
    assert results[1]["position_delta"] == -1  # Started P1, finishes P2 (-1 loss)
    assert results[0]["projected_total_time"] < results[1]["projected_total_time"]


def test_pit_stop_simulation_forced_on_tyre_expiry() -> None:
    """Verify that when tyre age reaches maximum compound life, a pit stop is scheduled."""
    current_positions = [
        {"driver_number": 44, "driver_name": "Lewis Hamilton", "team": "Mercedes", "position": 1, "gap_to_leader": 0.0},
    ]
    # Soft tyre with max life 20 laps, starting at age 18 with 25 laps remaining
    tyre_ages = {44: 18}
    compounds = {44: "SOFT"}
    lap_times = {44: [91.0, 91.1, 91.2, 91.3, 91.4]}

    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=20,
        total_laps=45,
        pit_loss_time=22.0,
    )

    assert len(results) == 1
    # Tyre reaches age 20 in 2 laps, forcing a pit stop
    assert results[0]["projected_pit_stops"] >= 1


def test_confidence_score_higher_near_race_end() -> None:
    """Verify prediction confidence increases as remaining laps decrease."""
    current_positions = [
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull Racing", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 11, "driver_name": "Sergio Perez", "team": "Red Bull Racing", "position": 2, "gap_to_leader": 10.0},
    ]
    tyre_ages = {1: 10, 11: 10}
    compounds = {1: "MEDIUM", 11: "MEDIUM"}
    lap_times = {
        1: [90.0, 90.0, 90.1, 90.0, 90.1],
        11: [90.8, 90.7, 90.8, 90.8, 90.7],
    }

    # Early in the race (lap 10 of 60)
    early_results = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=10,
        total_laps=60,
    )

    # Near race finish (lap 55 of 60)
    late_results = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=55,
        total_laps=60,
    )

    assert late_results[0]["confidence_score"] > early_results[0]["confidence_score"]


def test_confidence_score_lower_in_tight_battle() -> None:
    """Verify confidence score drops when drivers are within 1.0 second of each other."""
    # Scenario A: Tight battle (separated by only 0.2s)
    positions_tight = [
        {"driver_number": 4, "driver_name": "Lando Norris", "team": "McLaren", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 81, "driver_name": "Oscar Piastri", "team": "McLaren", "position": 2, "gap_to_leader": 0.2},
    ]
    tyre_ages = {4: 10, 81: 10}
    compounds = {4: "MEDIUM", 81: "MEDIUM"}
    # Identical pace
    lap_times_tight = {
        4: [90.0, 90.0, 90.0, 90.0, 90.0],
        81: [90.0, 90.0, 90.0, 90.0, 90.0],
    }

    results_tight = predict_race_result(
        current_positions=positions_tight,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times_tight,
        current_lap=30,
        total_laps=50,
    )

    # Scenario B: Large gap (separated by 15.0s)
    positions_large = [
        {"driver_number": 4, "driver_name": "Lando Norris", "team": "McLaren", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 81, "driver_name": "Oscar Piastri", "team": "McLaren", "position": 2, "gap_to_leader": 15.0},
    ]
    results_large = predict_race_result(
        current_positions=positions_large,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times_tight,
        current_lap=30,
        total_laps=50,
    )

    # Confidence should be noticeably higher with large margin than in the sub-second dogfight
    assert results_tight[0]["confidence_score"] < results_large[0]["confidence_score"]


def test_confidence_score_leader_well_ahead() -> None:
    """Verify dominant leader with large margin receives high confidence score."""
    current_positions = [
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull Racing", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 16, "driver_name": "Charles Leclerc", "team": "Ferrari", "position": 2, "gap_to_leader": 25.0},
    ]
    tyre_ages = {1: 12, 16: 12}
    compounds = {1: "HARD", 16: "HARD"}
    lap_times = {
        1: [89.0, 89.0, 89.1, 89.0, 89.1],
        16: [90.5, 90.6, 90.5, 90.6, 90.5],
    }

    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages=tyre_ages,
        compounds=compounds,
        lap_times=lap_times,
        current_lap=45,
        total_laps=50,
    )

    # Dominant leader with 25s margin near race finish should have very high confidence (> 0.85)
    assert results[0]["confidence_score"] >= 0.85


def test_edge_case_final_lap() -> None:
    """Verify final lap (remaining laps = 0) returns current order with 1.0 confidence and 0 pit stops."""
    current_positions = [
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 4, "driver_name": "Lando Norris", "team": "McLaren", "position": 2, "gap_to_leader": 4.5},
    ]
    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages={1: 20, 4: 20},
        compounds={1: "HARD", 4: "HARD"},
        lap_times={1: [90.0], 4: [90.2]},
        current_lap=57,
        total_laps=57,
    )

    assert len(results) == 2
    assert results[0]["predicted_position"] == 1
    assert results[0]["position_delta"] == 0
    assert results[0]["confidence_score"] == 1.0
    assert results[0]["projected_pit_stops"] == 0

    assert results[1]["predicted_position"] == 2
    assert results[1]["position_delta"] == 0
    assert results[1]["confidence_score"] == 1.0
    assert results[1]["projected_pit_stops"] == 0


def test_edge_case_empty_positions() -> None:
    """Verify empty current_positions list returns an empty list without error."""
    results = predict_race_result(
        current_positions=[],
        tyre_ages={},
        compounds={},
        lap_times={},
        current_lap=10,
        total_laps=50,
    )
    assert results == []


def test_edge_case_missing_driver_lap_times() -> None:
    """Verify drivers without lap telemetry are handled with fallback grid pace."""
    current_positions = [
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull", "position": 1, "gap_to_leader": 0.0},
        {"driver_number": 2, "driver_name": "Logan Sargeant", "team": "Williams", "position": 2, "gap_to_leader": 3.0},
    ]
    # Sargeant has no recorded lap times
    lap_times = {1: [90.0, 90.1, 90.0]}

    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages={1: 10, 2: 10},
        compounds={1: "MEDIUM", 2: "MEDIUM"},
        lap_times=lap_times,
        current_lap=15,
        total_laps=40,
    )

    assert len(results) == 2
    assert results[0]["predicted_position"] == 1
    assert results[1]["predicted_position"] == 2
    assert results[1]["projected_total_time"] > 0


def test_edge_case_single_driver() -> None:
    """Verify simulation handles a single driver correctly."""
    current_positions = [
        {"driver_number": 63, "driver_name": "George Russell", "team": "Mercedes", "position": 1},
    ]
    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages={63: 8},
        compounds={63: "MEDIUM"},
        lap_times={63: [90.5, 90.6, 90.5]},
        current_lap=10,
        total_laps=30,
    )
    assert len(results) == 1
    assert results[0]["predicted_position"] == 1
    assert results[0]["position_delta"] == 0
    assert 0.0 <= results[0]["confidence_score"] <= 1.0


def test_return_schema_all_keys_present() -> None:
    """Verify all expected dictionary keys are returned with correct types."""
    current_positions = [
        {"driver_number": 1, "driver_name": "Max Verstappen", "team": "Red Bull", "position": 1},
    ]
    results = predict_race_result(
        current_positions=current_positions,
        tyre_ages={1: 5},
        compounds={1: "MEDIUM"},
        lap_times={1: [90.0, 90.1, 90.2]},
        current_lap=10,
        total_laps=20,
    )
    item = results[0]
    expected_keys = {
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
    assert expected_keys.issubset(item.keys())
    assert isinstance(item["predicted_position"], int)
    assert isinstance(item["driver_number"], int)
    assert isinstance(item["driver_name"], str)
    assert isinstance(item["team"], str)
    assert isinstance(item["current_position"], int)
    assert isinstance(item["position_delta"], int)
    assert isinstance(item["projected_total_time"], float)
    assert isinstance(item["confidence_score"], float)
    assert isinstance(item["projected_pit_stops"], int)
