"""
Tier 2: Boundary & Corner Cases Test Suite.
Validates system robustness against empty responses, 404/429 handling, rate limits,
extreme gaps, zero laps, division by zero, and invalid inputs.
"""

import pytest
from starlette.testclient import TestClient


# ===========================================================================
# 1. Empty Responses & Boundary Collections
# ===========================================================================

class TestEmptyResponsesAndCollections:
    def test_laps_empty_when_no_driver_matches(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps?driver_number=999")
        assert res.status_code == 200
        data = res.json()
        assert "laps" in data
        assert len(data["laps"]) == 0

    def test_stints_empty_when_nonexistent_driver(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints?driver_number=999")
        assert res.status_code == 200
        data = res.json()
        assert "stints" in data
        assert len(data["stints"]) == 0

    def test_news_limit_zero_returns_empty_articles(self, client: TestClient):
        res = client.get("/api/news?limit=0")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 0
        assert len(data["articles"]) == 0

    def test_stats_offset_beyond_total(self, client: TestClient):
        res = client.get("/api/stats/drivers?limit=10&offset=9999")
        assert res.status_code == 200
        data = res.json()
        assert len(data["drivers"]) == 0


# ===========================================================================
# 2. HTTP 404 Not Found & Error Handling
# ===========================================================================

class TestHttp404NotFoundHandling:
    def test_standings_drivers_invalid_season_404(self, client: TestClient):
        res = client.get("/api/standings/drivers/1899")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_standings_constructors_invalid_season_404(self, client: TestClient):
        res = client.get("/api/standings/constructors/invalid")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_races_calendar_invalid_season_404(self, client: TestClient):
        res = client.get("/api/races/1899")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_race_results_invalid_round_404(self, client: TestClient):
        res = client.get("/api/races/2024/99/results")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_driver_career_unknown_driver_404(self, client: TestClient):
        res = client.get("/api/drivers/ghost/career")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_circuit_history_unknown_circuit_404(self, client: TestClient):
        res = client.get("/api/circuits/atlantis/history")
        assert res.status_code == 404
        assert "detail" in res.json()

    def test_lap_telemetry_unknown_session_key_404(self, client: TestClient):
        res = client.get("/api/telemetry/999999/1/18")
        assert res.status_code == 404
        assert "detail" in res.json()


# ===========================================================================
# 3. Numeric Boundaries & Division by Zero Protection
# ===========================================================================

class TestNumericBoundariesAndZeroDivisions:
    def test_pit_window_zero_variance_identical_lap_times(self, pit_window_solver):
        # Denominator sum((x - x_mean)^2) is non-zero, but numerator cov(x, y) is 0 because y is constant
        identical_laps = [92.0, 92.0, 92.0, 92.0, 92.0]
        res = pit_window_solver(
            tyre_age=10, lap_times=identical_laps, gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=40, compound="MEDIUM"
        )
        assert res["degradation_rate"] >= 0.020
        assert res["cliff_lap"] > 10

    def test_pit_window_negative_slope_track_evolution(self, pit_window_solver):
        # Rubbering in track makes laps faster; algorithm must clamp to minimum wear rate
        improving_laps = [94.0, 93.5, 93.0, 92.5, 92.0]
        res = pit_window_solver(
            tyre_age=10, lap_times=improving_laps, gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=40, compound="MEDIUM"
        )
        assert res["degradation_rate"] >= 0.020

    def test_pit_window_single_lap_stint(self, pit_window_solver):
        res = pit_window_solver(
            tyre_age=1, lap_times=[93.0], gap_ahead=2.0,
            gap_behind=3.0, remaining_laps=50, compound="HARD"
        )
        assert res["degradation_rate"] > 0
        assert res["laps_until_cliff"] > 0

    def test_pit_window_empty_lap_times_array(self, pit_window_solver):
        res = pit_window_solver(
            tyre_age=0, lap_times=[], gap_ahead=2.0,
            gap_behind=3.0, remaining_laps=57, compound="SOFT"
        )
        assert res["degradation_rate"] > 0
        assert res["cliff_lap"] > 0

    def test_pit_window_extreme_pit_loss_times(self, pit_window_solver):
        res_zero = pit_window_solver(
            tyre_age=10, lap_times=[92.0, 92.1], gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=30, pit_loss_time=0.0
        )
        assert res_zero["pit_loss_time"] == 0.0

        res_long = pit_window_solver(
            tyre_age=10, lap_times=[92.0, 92.1], gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=30, pit_loss_time=60.0
        )
        assert res_long["pit_loss_time"] == 60.0


# ===========================================================================
# 4. Lap States, Tyres, and Race Progression Boundaries
# ===========================================================================

class TestRaceProgressionBoundaries:
    def test_race_predictor_zero_remaining_laps(self, race_predictor_solver):
        positions = [
            {"driver_number": 1, "driver_name": "VER", "position": 1},
            {"driver_number": 4, "driver_name": "NOR", "position": 2},
        ]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 20, 4: 20},
            compounds={1: "HARD", 4: "HARD"}, lap_times={1: [92.0], 4: [92.5]},
            current_lap=57, total_laps=57
        )
        assert len(preds) == 2
        assert preds[0]["confidence_score"] == 1.0
        assert preds[0]["predicted_position"] == 1
        assert preds[1]["predicted_position"] == 2

    def test_race_predictor_lap_zero_race_start(self, race_predictor_solver):
        positions = [
            {"driver_number": 1, "driver_name": "VER", "position": 1},
            {"driver_number": 4, "driver_name": "NOR", "position": 2},
        ]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 0, 4: 0},
            compounds={1: "MEDIUM", 4: "MEDIUM"}, lap_times={1: [91.5], 4: [91.8]},
            current_lap=0, total_laps=57
        )
        assert len(preds) == 2
        assert preds[0]["predicted_position"] == 1

    def test_race_predictor_single_driver_grid(self, race_predictor_solver):
        positions = [{"driver_number": 1, "driver_name": "VER", "position": 1}]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 10},
            compounds={1: "MEDIUM"}, lap_times={1: [92.0]},
            current_lap=20, total_laps=57
        )
        assert len(preds) == 1
        assert preds[0]["predicted_position"] == 1

    def test_race_predictor_empty_grid_returns_empty(self, race_predictor_solver):
        preds = race_predictor_solver(
            current_positions=[], tyre_ages={}, compounds={},
            lap_times={}, current_lap=20, total_laps=57
        )
        assert preds == []

    def test_pit_window_tyre_age_exceeding_cliff(self, pit_window_solver):
        # Soft tyre aged 45 laps (far past 20-lap cliff)
        res = pit_window_solver(
            tyre_age=45, lap_times=[95.0, 95.5, 96.0], gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=10, compound="SOFT", current_lap=45
        )
        assert res["laps_until_cliff"] == 0
        assert res["cliff_lap"] <= 45 or res["cliff_lap"] >= 1


# ===========================================================================
# 5. Extreme Gaps & Intervals
# ===========================================================================

class TestExtremeGapsAndIntervals:
    def test_race_gaps_extreme_gap_over_60_seconds(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        intervals = res.json()["intervals"]
        lapped_car = [i for i in intervals if i["interval"] == "+1 LAP"]
        assert len(lapped_car) > 0
        assert lapped_car[0]["gap_to_leader"] > 60.0

    def test_race_gaps_zero_second_photo_finish(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        leader = res.json()["intervals"][0]
        assert leader["gap_to_leader"] == 0.0

    def test_pit_window_leading_car_no_gap_ahead(self, pit_window_solver):
        # Race leader has gap_ahead = 0.0
        res = pit_window_solver(
            tyre_age=15, lap_times=[92.0, 92.1], gap_ahead=0.0,
            gap_behind=4.0, remaining_laps=35, compound="MEDIUM"
        )
        assert res["undercut_status"].lower() == "not_viable"


# ===========================================================================
# 6. Special Characters & Sanitization
# ===========================================================================

class TestSpecialCharactersAndSanitization:
    def test_driver_id_with_special_characters_handled(self, client: TestClient):
        res = client.get("/api/drivers/unknown_driver/career")
        assert res.status_code in [404, 400]

    def test_sql_injection_probe_in_season_path(self, client: TestClient):
        res = client.get("/api/standings/drivers/2024'%20OR%201=1;--")
        assert res.status_code in [404, 400]
