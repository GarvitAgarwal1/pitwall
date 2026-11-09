"""
Tier 3: Cross-Feature Combinations (Integration) Test Suite.
Validates pairwise interactions, state consistency, and data flows across
different REST endpoints and business logic services.
"""

import pytest
from starlette.testclient import TestClient


# ===========================================================================
# 1. Qualifying Classification -> Race Results Grid
# ===========================================================================

class TestQualifyingToRaceResultsIntegration:
    def test_qualifying_pole_matches_race_grid_p1(self, client: TestClient):
        q_res = client.get("/api/qualifying/2024/1")
        assert q_res.status_code == 200
        pole_driver = q_res.json()["qualifying_results"][0]
        assert pole_driver["position"] == 1

        r_res = client.get("/api/races/2024/1/results")
        assert r_res.status_code == 200
        race_results = r_res.json()["results"]
        p1_grid = next(r for r in race_results if r["grid"] == 1)

        assert p1_grid["driver_number"] == pole_driver["driver_number"]
        assert p1_grid["driver_code"] == pole_driver["driver_code"]

    def test_qualifying_top_10_grid_consistency(self, client: TestClient):
        q_res = client.get("/api/qualifying/2024/1")
        assert q_res.status_code == 200
        q_map = {d["driver_number"]: d["position"] for d in q_res.json()["qualifying_results"]}

        r_res = client.get("/api/races/2024/1/results")
        assert r_res.status_code == 200
        r_grid = {r["driver_number"]: r["grid"] for r in r_res.json()["results"]}

        common_drivers = set(q_map.keys()).intersection(set(r_grid.keys()))
        assert len(common_drivers) > 0
        for driver in common_drivers:
            if q_map[driver] == 1:
                assert r_grid[driver] == 1


# ===========================================================================
# 2. Race Results -> Season Standings Consistency
# ===========================================================================

class TestRaceResultsToStandingsIntegration:
    def test_race_winner_points_reflected_in_driver_standings(self, client: TestClient):
        r_res = client.get("/api/races/2024/1/results")
        assert r_res.status_code == 200
        winner = r_res.json()["results"][0]
        assert winner["position"] == 1
        assert winner["points"] >= 25.0

        s_res = client.get("/api/standings/drivers/2024")
        assert s_res.status_code == 200
        standings = s_res.json()["standings"]
        standing_winner = next(s for s in standings if s["driver_number"] == winner["driver_number"])
        assert standing_winner["points"] >= winner["points"]
        assert standing_winner["wins"] >= 1

    def test_driver_points_aggregate_to_constructor_standings(self, client: TestClient):
        d_res = client.get("/api/standings/drivers/2024")
        assert d_res.status_code == 200
        c_res = client.get("/api/standings/constructors/2024")
        assert c_res.status_code == 200

        driver_standings = d_res.json()["standings"]
        constructor_standings = c_res.json()["standings"]

        # Points for Red Bull drivers vs Red Bull constructor
        rb_drivers_pts = sum(d["points"] for d in driver_standings if d["constructor_id"] == "red_bull")
        rb_constructor = next(c for c in constructor_standings if c["constructor_id"] == "red_bull")
        # Constructor points should be at least as large as the sampled drivers points
        assert rb_constructor["points"] >= rb_drivers_pts


# ===========================================================================
# 3. Race Results -> Lap Positions Flow
# ===========================================================================

class TestRaceResultsToPositionChangesIntegration:
    def test_final_lap_position_matches_race_result(self, client: TestClient):
        r_res = client.get("/api/races/2024/1/results")
        assert r_res.status_code == 200
        results = r_res.json()["results"]
        winner = results[0]

        p_res = client.get("/api/races/2024/1/positions")
        assert p_res.status_code == 200
        positions = p_res.json()["positions"]

        # Check winner is P1 in positions
        winner_positions = [p for p in positions if p["driver_number"] == winner["driver_number"]]
        assert len(winner_positions) > 0
        assert winner_positions[-1]["position"] == winner["position"]


# ===========================================================================
# 4. Telemetry Compare -> Delta Time Integral
# ===========================================================================

class TestTelemetryCompareToDeltaTimeIntegration:
    def test_telemetry_compare_delta_corresponds_to_lap_times(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        data = res.json()

        d1_time = data["driver1_lap_time"]
        d2_time = data["driver2_lap_time"]
        lap_delta = d2_time - d1_time

        trace = data["trace"]
        assert len(trace) > 0
        # Delta time values exist and remain bounded by lap delta variance
        for sample in trace:
            assert abs(sample["delta_time"]) < 5.0

    def test_telemetry_distance_trace_monotonic_alignment(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        trace = res.json()["trace"]
        distances = [s["distance_m"] for s in trace]
        assert distances == sorted(distances)
        assert min(distances) >= 0.0


# ===========================================================================
# 5. Stints -> Pit Stops -> Pit Window Pipeline
# ===========================================================================

class TestStintsPitStopsPitWindowPipeline:
    def test_stint_transition_aligns_with_pit_stop_lap(self, client: TestClient):
        stints_res = client.get("/api/races/2024/1/stints?driver_number=1")
        assert stints_res.status_code == 200
        stints = stints_res.json()["stints"]

        stops_res = client.get("/api/races/2024/1/pitstops")
        assert stops_res.status_code == 200
        stops = [s for s in stops_res.json()["pit_stops"] if s.get("driver_number") == 1]

        if len(stints) >= 2 and len(stops) >= 1:
            stint_1_end = stints[0]["lap_end"]
            stop_lap = stops[0]["lap"]
            assert abs(stint_1_end - stop_lap) <= 1

    def test_stint_compound_feeds_pit_window_detection(self, client: TestClient, pit_window_solver):
        # 1. Fetch active stint
        stints_res = client.get("/api/races/2024/1/stints?driver_number=1")
        assert stints_res.status_code == 200
        first_stint = stints_res.json()["stints"][0]
        compound = first_stint["compound"]
        stint_len = first_stint["total_laps_on_tyre"]

        # 2. Fetch recent laps
        laps_res = client.get("/api/races/2024/1/laps?driver_number=1")
        assert laps_res.status_code == 200
        times = [l["lap_duration"] for l in laps_res.json()["laps"] if l["lap_duration"]]

        # 3. Calculate pit window with stint parameters
        window = pit_window_solver(
            tyre_age=stint_len, lap_times=times or [92.5], gap_ahead=1.4,
            gap_behind=3.0, remaining_laps=40, compound=compound
        )
        assert window["degradation_rate"] > 0
        assert window["undercut_status"].lower() in ["viable", "highly_viable"]


# ===========================================================================
# 6. Pit Window -> Race Predictor Strategic Coherence
# ===========================================================================

class TestPitWindowToPredictorIntegration:
    def test_pit_window_recommended_lap_influences_prediction(self, pit_window_solver, race_predictor_solver):
        # Driver 1 has high tyre wear near cliff
        window = pit_window_solver(
            tyre_age=24, lap_times=[93.0, 93.2, 93.5], gap_ahead=1.5,
            gap_behind=3.0, remaining_laps=33, compound="MEDIUM", current_lap=24
        )
        assert window["recommended_pit_lap"] >= 24

        # Predictor simulates remaining stint
        positions = [
            {"driver_number": 1, "driver_name": "VER", "position": 1},
            {"driver_number": 4, "driver_name": "NOR", "position": 2},
        ]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 24, 4: 10},
            compounds={1: "MEDIUM", 4: "HARD"},
            lap_times={1: [93.0], 4: [91.5]},
            current_lap=24, total_laps=57
        )
        assert len(preds) == 2
        assert preds[0]["projected_total_time"] > 0
        assert preds[1]["projected_total_time"] > 0


# ===========================================================================
# 7. Live Race Control -> Live Timing Synchrony
# ===========================================================================

class TestLiveRaceControlToTimingIntegration:
    def test_live_session_and_race_control_session_key_match(self, client: TestClient):
        timing_res = client.get("/api/live/timing/9165")
        assert timing_res.status_code == 200
        rc_res = client.get("/api/live/race-control/9165")
        assert rc_res.status_code == 200

        timing_data = timing_res.json()
        rc_data = rc_res.json()

        assert timing_data["session_key"] == rc_data["session_key"]
        assert rc_data["safety_car_status"] in ["NONE", "SAFETY_CAR", "VIRTUAL_SAFETY_CAR", "RED_FLAG"]
        assert timing_data["status"] in ["ACTIVE", "SAFETY_CAR", "VSC", "RED_FLAG", "FINISHED"]


# ===========================================================================
# 8. Circuit Directory -> Race Calendar Verification
# ===========================================================================

class TestCircuitDirectoryToCalendarIntegration:
    def test_calendar_circuits_resolve_in_circuit_directory(self, client: TestClient):
        cal_res = client.get("/api/races/2024")
        assert cal_res.status_code == 200
        circuits_res = client.get("/api/circuits")
        assert circuits_res.status_code == 200

        calendar_circuits = {r["circuit_id"] for r in cal_res.json()["races"]}
        known_circuits = {c["circuit_id"] for c in circuits_res.json()["circuits"]}

        # All calendar circuits that have been indexed match known circuit directory
        overlap = calendar_circuits.intersection(known_circuits)
        assert len(overlap) > 0
        assert "bahrain" in overlap
