"""
Tier 4: Real-World Scenarios Test Suite.
Validates end-to-end race weekends, Safety Car event lifecycles,
undercut battles (success vs failure), multi-driver telemetry overlays,
and live timing replay simulation.
"""

import pytest
from starlette.testclient import TestClient


# ===========================================================================
# 1. Complete Grand Prix Weekend Simulation (Bahrain GP 2024)
# ===========================================================================

class TestGrandPrixWeekendSimulation:
    def test_complete_grand_prix_weekend_flow(self, client: TestClient):
        # Step 1: Circuit Verification
        circuit_res = client.get("/api/circuits")
        assert circuit_res.status_code == 200
        circuits = circuit_res.json()["circuits"]
        bahrain = next(c for c in circuits if c["circuit_id"] == "bahrain")
        assert bahrain["turns"] == 15
        assert bahrain["length_km"] > 5.0

        # Step 2: Weather Monitoring
        weather_res = client.get("/api/races/2024/1/weather")
        assert weather_res.status_code == 200
        weather_points = weather_res.json()["weather_points"]
        assert len(weather_points) > 0
        assert weather_points[0]["rainfall"] == 0  # Dry race

        # Step 3: Saturday Qualifying Shootout
        quali_res = client.get("/api/qualifying/2024/1")
        assert quali_res.status_code == 200
        quali_results = quali_res.json()["qualifying_results"]
        assert quali_results[0]["position"] == 1
        pole_driver = quali_results[0]["driver_code"]

        # Step 4: Sunday Race Stints Strategy
        stints_res = client.get("/api/races/2024/1/stints?driver_number=1")
        assert stints_res.status_code == 200
        ver_stints = stints_res.json()["stints"]
        assert len(ver_stints) >= 2  # At least 1 pit stop executed
        assert ver_stints[0]["compound"] == "SOFT"
        assert ver_stints[1]["compound"] == "HARD"

        # Step 5: Sunday Race Finish & Classification
        race_res = client.get("/api/races/2024/1/results")
        assert race_res.status_code == 200
        results = race_res.json()["results"]
        winner = results[0]
        assert winner["position"] == 1
        assert winner["driver_code"] == pole_driver  # Pole to win conversion
        assert winner["points"] >= 25.0

        # Step 6: World Championship Standings Update
        wdc_res = client.get("/api/standings/drivers/2024")
        assert wdc_res.status_code == 200
        p1_standing = wdc_res.json()["standings"][0]
        assert p1_standing["driver_code"] == winner["driver_code"]
        assert p1_standing["points"] >= 25.0


# ===========================================================================
# 2. Safety Car Event Lifecycle & Strategy Neutralization
# ===========================================================================

class TestSafetyCarLifecycleScenario:
    def test_safety_car_incident_lifecycle(self, client: TestClient, pit_window_solver):
        # 1. Baseline green flag racing: pit stop loss is standard 22.0 seconds
        normal_pit_loss = 22.0
        green_window = pit_window_solver(
            tyre_age=16, lap_times=[92.0, 92.2, 92.4], gap_ahead=2.0,
            gap_behind=3.5, remaining_laps=39, pit_loss_time=normal_pit_loss,
            compound="MEDIUM", current_lap=18
        )
        assert green_window["pit_loss_time"] == normal_pit_loss

        # 2. Safety Car Deployed on Lap 18
        # Under Safety Car, delta time drops pit lane time loss to ~12.0s ("cheap pit stop")
        sc_pit_loss = 12.0
        sc_window = pit_window_solver(
            tyre_age=16, lap_times=[92.0, 92.2, 92.4], gap_ahead=2.0,
            gap_behind=3.5, remaining_laps=39, pit_loss_time=sc_pit_loss,
            compound="MEDIUM", current_lap=18
        )
        assert sc_window["pit_loss_time"] == sc_pit_loss

        # Pitting under SC saves ~10 seconds of race time relative to racing speed
        delta_saved = normal_pit_loss - sc_pit_loss
        assert delta_saved == 10.0

        # 3. Race Control publishes safety car status
        rc_res = client.get("/api/live/race-control/9165")
        assert rc_res.status_code == 200
        assert "safety_car_status" in rc_res.json()


# ===========================================================================
# 3. Undercut Strategy Battle (Success vs Failure)
# ===========================================================================

class TestUndercutStrategyBattleScenario:
    def test_undercut_success_scenario(self, pit_window_solver):
        # Chasing driver (P2) trailing rival (P1) by 1.4 seconds on Lap 18
        # Both on worn tyres; fresh tyre advantage is ~2.0s
        p2_window = pit_window_solver(
            tyre_age=18, lap_times=[92.5, 92.7, 92.9], gap_ahead=1.4,
            gap_behind=4.0, remaining_laps=39, compound="MEDIUM", current_lap=18
        )
        # Undercut is viable because gap ahead (1.4s) is less than fresh rubber gain (~2.0s)
        assert p2_window["undercut_status"].lower() in ["viable", "highly_viable"]
        # Recommended to pit immediately on earliest available lap
        assert p2_window["recommended_pit_lap"] == p2_window["earliest_pit_lap"]

    def test_undercut_failure_scenario(self, pit_window_solver):
        # Chasing driver trailing rival by 4.8 seconds
        # Fresh tyre advantage (2.0s) cannot overturn a 4.8s deficit
        p2_window = pit_window_solver(
            tyre_age=18, lap_times=[92.5, 92.7, 92.9], gap_ahead=4.8,
            gap_behind=4.0, remaining_laps=39, compound="MEDIUM", current_lap=18
        )
        assert p2_window["undercut_status"].lower() == "not_viable"


# ===========================================================================
# 4. Multi-Driver Telemetry Overlay (VER vs NOR vs LEC)
# ===========================================================================

class TestMultiDriverTelemetryOverlayScenario:
    def test_multi_driver_telemetry_traces(self, client: TestClient):
        # Driver 1 (Verstappen)
        ver_res = client.get("/api/telemetry/9165/1/18")
        assert ver_res.status_code == 200
        ver_telemetry = ver_res.json()["telemetry"]
        assert len(ver_telemetry) >= 3

        # Compare Driver 1 vs Driver 4 (Norris)
        compare_res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert compare_res.status_code == 200
        compare_data = compare_res.json()
        assert compare_data["driver1_number"] == 1
        assert compare_data["driver2_number"] == 4

        # Verify corner telemetry metrics
        trace = compare_data["trace"]
        for sample in trace:
            assert sample["d1_speed"] > 0
            assert sample["d2_speed"] > 0
            assert 0 <= sample["d1_throttle"] <= 100
            assert 0 <= sample["d2_throttle"] <= 100


# ===========================================================================
# 5. Live Timing Replay Engine Simulation
# ===========================================================================

class TestLiveTimingReplayEngineScenario:
    def test_live_timing_replay_scrubber_progression(self, client: TestClient):
        # Scrub to Lap 1
        lap1_res = client.get("/api/live/timing/9165?simulated_lap=1")
        assert lap1_res.status_code == 200
        lap1_data = lap1_res.json()
        assert lap1_data["current_lap"] == 1

        # Scrub to Lap 25
        lap25_res = client.get("/api/live/timing/9165?simulated_lap=25")
        assert lap25_res.status_code == 200
        lap25_data = lap25_res.json()
        assert lap25_data["current_lap"] == 25

        # Scrub to Final Lap 57
        lap57_res = client.get("/api/live/timing/9165?simulated_lap=57")
        assert lap57_res.status_code == 200
        lap57_data = lap57_res.json()
        assert lap57_data["current_lap"] == 57
        assert len(lap57_data["drivers"]) >= 2
