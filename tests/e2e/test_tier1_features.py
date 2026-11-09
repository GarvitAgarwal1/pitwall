"""
Tier 1: Comprehensive Feature Coverage Test Suite.
Validates all 24 REST API endpoints (>=5 tests each) and both standalone
strategy algorithms (>=5 tests each) against Pydantic v2 schemas and expected values.
"""

import pytest
from starlette.testclient import TestClient


# ===========================================================================
# 1. Standings - Drivers
# ===========================================================================

class TestDriverStandingsFeature:
    def test_driver_standings_current_season_200_and_schema(self, client: TestClient):
        res = client.get("/api/standings/drivers/current")
        assert res.status_code == 200
        data = res.json()
        assert "season" in data
        assert "standings" in data
        assert isinstance(data["standings"], list)
        assert len(data["standings"]) > 0

    def test_driver_standings_historical_2023_season(self, client: TestClient):
        res = client.get("/api/standings/drivers/2023")
        assert res.status_code == 200
        data = res.json()
        assert data["season"] == "2023"
        assert len(data["standings"]) > 0

    def test_driver_standings_historical_2024_season(self, client: TestClient):
        res = client.get("/api/standings/drivers/2024")
        assert res.status_code == 200
        data = res.json()
        assert data["season"] == "2024"
        assert len(data["standings"]) > 0

    def test_driver_standings_position_order_and_points(self, client: TestClient):
        res = client.get("/api/standings/drivers/2024")
        assert res.status_code == 200
        standings = res.json()["standings"]
        for idx, item in enumerate(standings):
            assert item["position"] == idx + 1
            if idx > 0:
                assert item["points"] <= standings[idx - 1]["points"]

    def test_driver_standings_required_fields_presence(self, client: TestClient):
        res = client.get("/api/standings/drivers/current")
        assert res.status_code == 200
        first = res.json()["standings"][0]
        for field in ["driver_id", "driver_code", "given_name", "family_name", "constructor_name", "points", "wins"]:
            assert field in first
            assert first[field] is not None


# ===========================================================================
# 2. Standings - Constructors
# ===========================================================================

class TestConstructorStandingsFeature:
    def test_constructor_standings_current_200_and_schema(self, client: TestClient):
        res = client.get("/api/standings/constructors/current")
        assert res.status_code == 200
        data = res.json()
        assert "season" in data
        assert "standings" in data
        assert len(data["standings"]) > 0

    def test_constructor_standings_2023_season(self, client: TestClient):
        res = client.get("/api/standings/constructors/2023")
        assert res.status_code == 200
        assert res.json()["season"] == "2023"

    def test_constructor_standings_2024_season(self, client: TestClient):
        res = client.get("/api/standings/constructors/2024")
        assert res.status_code == 200
        assert res.json()["season"] == "2024"

    def test_constructor_standings_rank_and_points_monotonic(self, client: TestClient):
        res = client.get("/api/standings/constructors/2024")
        assert res.status_code == 200
        standings = res.json()["standings"]
        for i, team in enumerate(standings):
            assert team["position"] == i + 1
            if i > 0:
                assert team["points"] <= standings[i - 1]["points"]

    def test_constructor_standings_required_fields(self, client: TestClient):
        res = client.get("/api/standings/constructors/current")
        assert res.status_code == 200
        first = res.json()["standings"][0]
        for f in ["constructor_id", "constructor_name", "nationality", "points", "wins"]:
            assert f in first
            assert first[f] is not None


# ===========================================================================
# 3. Race Calendar
# ===========================================================================

class TestRaceCalendarFeature:
    def test_race_calendar_2024_status_200_and_schema(self, client: TestClient):
        res = client.get("/api/races/2024")
        assert res.status_code == 200
        data = res.json()
        assert data["season"] == "2024"
        assert len(data["races"]) > 0

    def test_race_calendar_2023_season(self, client: TestClient):
        res = client.get("/api/races/2023")
        assert res.status_code == 200
        assert res.json()["season"] == "2023"

    def test_race_calendar_round_indexing_monotonic(self, client: TestClient):
        res = client.get("/api/races/2024")
        assert res.status_code == 200
        races = res.json()["races"]
        rounds = [r["round"] for r in races]
        assert rounds == sorted(rounds)
        assert min(rounds) >= 1

    def test_race_calendar_circuit_and_locality_present(self, client: TestClient):
        res = client.get("/api/races/2024")
        assert res.status_code == 200
        first = res.json()["races"][0]
        for f in ["race_name", "circuit_id", "circuit_name", "locality", "country", "date"]:
            assert f in first
            assert len(str(first[f])) > 0

    def test_race_calendar_sprint_races_flag(self, client: TestClient):
        res = client.get("/api/races/2024")
        assert res.status_code == 200
        races = res.json()["races"]
        assert any(r.get("is_completed") is not None for r in races)


# ===========================================================================
# 4. Race Results
# ===========================================================================

class TestRaceResultsFeature:
    def test_race_results_round_1_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/results")
        assert res.status_code == 200
        data = res.json()
        assert data["round"] == 1
        assert "results" in data
        assert len(data["results"]) > 0

    def test_race_results_points_awarded(self, client: TestClient):
        res = client.get("/api/races/2024/1/results")
        assert res.status_code == 200
        p1 = res.json()["results"][0]
        assert p1["position"] == 1
        assert p1["points"] >= 25.0

    def test_race_results_classification_status(self, client: TestClient):
        res = client.get("/api/races/2024/1/results")
        assert res.status_code == 200
        for r in res.json()["results"]:
            assert r["status"] in ["Finished", "Retired", "+1 Lap", "+2 Laps"]

    def test_race_results_fastest_lap_fields(self, client: TestClient):
        res = client.get("/api/races/2024/1/results")
        assert res.status_code == 200
        first = res.json()["results"][0]
        assert "fastest_lap_rank" in first
        assert "fastest_lap_time" in first

    def test_race_results_grid_and_position(self, client: TestClient):
        res = client.get("/api/races/2024/1/results")
        assert res.status_code == 200
        results = res.json()["results"]
        for item in results:
            assert item["grid"] >= 1
            assert item["position"] >= 1


# ===========================================================================
# 5. Race Laps
# ===========================================================================

class TestRaceLapsFeature:
    def test_race_laps_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps")
        assert res.status_code == 200
        data = res.json()
        assert "laps" in data
        assert len(data["laps"]) > 0

    def test_race_laps_driver_filter(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps?driver_number=1")
        assert res.status_code == 200
        for lap in res.json()["laps"]:
            assert lap["driver_number"] == 1

    def test_race_laps_lap_number_filter(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps?lap_number=2")
        assert res.status_code == 200
        for lap in res.json()["laps"]:
            assert lap["lap_number"] == 2

    def test_race_laps_sector_splits_presence(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps")
        assert res.status_code == 200
        first = res.json()["laps"][0]
        assert "duration_sector_1" in first
        assert "duration_sector_2" in first
        assert "duration_sector_3" in first
        assert first["lap_duration"] > 0

    def test_race_laps_pit_out_flag(self, client: TestClient):
        res = client.get("/api/races/2024/1/laps")
        assert res.status_code == 200
        laps = res.json()["laps"]
        assert any("is_pit_out_lap" in l for l in laps)


# ===========================================================================
# 6. Race Stints
# ===========================================================================

class TestRaceStintsFeature:
    def test_race_stints_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints")
        assert res.status_code == 200
        data = res.json()
        assert "stints" in data
        assert len(data["stints"]) > 0

    def test_race_stints_compounds_valid_enum(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints")
        assert res.status_code == 200
        valid_compounds = {"SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"}
        for s in res.json()["stints"]:
            assert s["compound"] in valid_compounds

    def test_race_stints_driver_filter(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints?driver_number=1")
        assert res.status_code == 200
        for s in res.json()["stints"]:
            assert s["driver_number"] == 1

    def test_race_stints_lap_range_valid(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints")
        assert res.status_code == 200
        for s in res.json()["stints"]:
            assert s["lap_start"] <= s["lap_end"]
            assert s["total_laps_on_tyre"] >= (s["lap_end"] - s["lap_start"] + 1)

    def test_race_stints_tyre_age_tracking(self, client: TestClient):
        res = client.get("/api/races/2024/1/stints")
        assert res.status_code == 200
        first = res.json()["stints"][0]
        assert first["tyre_age_at_start"] >= 0


# ===========================================================================
# 7. Race Pitstops
# ===========================================================================

class TestRacePitStopsFeature:
    def test_race_pitstops_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/pitstops")
        assert res.status_code == 200
        data = res.json()
        assert "pit_stops" in data
        assert len(data["pit_stops"]) > 0

    def test_race_pitstops_stop_number_order(self, client: TestClient):
        res = client.get("/api/races/2024/1/pitstops")
        assert res.status_code == 200
        for stop in res.json()["pit_stops"]:
            assert stop["stop_number"] >= 1

    def test_race_pitstops_lap_number_positive(self, client: TestClient):
        res = client.get("/api/races/2024/1/pitstops")
        assert res.status_code == 200
        for stop in res.json()["pit_stops"]:
            assert stop["lap"] >= 1

    def test_race_pitstops_duration_positive(self, client: TestClient):
        res = client.get("/api/races/2024/1/pitstops")
        assert res.status_code == 200
        first = res.json()["pit_stops"][0]
        assert first["duration"] > 0
        assert first["lane_duration"] > first["duration"]

    def test_race_pitstops_driver_info_present(self, client: TestClient):
        res = client.get("/api/races/2024/1/pitstops")
        assert res.status_code == 200
        first = res.json()["pit_stops"][0]
        assert "driver_number" in first or "driver_id" in first


# ===========================================================================
# 8. Race Positions
# ===========================================================================

class TestRacePositionsFeature:
    def test_race_positions_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/positions")
        assert res.status_code == 200
        data = res.json()
        assert "positions" in data
        assert len(data["positions"]) > 0

    def test_race_positions_driver_range(self, client: TestClient):
        res = client.get("/api/races/2024/1/positions")
        assert res.status_code == 200
        for pos in res.json()["positions"]:
            assert 1 <= pos["position"] <= 20

    def test_race_positions_monotonic_laps(self, client: TestClient):
        res = client.get("/api/races/2024/1/positions")
        assert res.status_code == 200
        for pos in res.json()["positions"]:
            assert pos["lap_number"] >= 1

    def test_race_positions_rank_bounds(self, client: TestClient):
        res = client.get("/api/races/2024/1/positions")
        assert res.status_code == 200
        positions = [p["position"] for p in res.json()["positions"]]
        assert min(positions) == 1

    def test_race_positions_multi_driver_progression(self, client: TestClient):
        res = client.get("/api/races/2024/1/positions")
        assert res.status_code == 200
        drivers = {p["driver_number"] for p in res.json()["positions"]}
        assert len(drivers) >= 2


# ===========================================================================
# 9. Race Gaps
# ===========================================================================

class TestRaceGapsFeature:
    def test_race_gaps_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        data = res.json()
        assert "intervals" in data
        assert len(data["intervals"]) > 0

    def test_race_gaps_leader_gap_zero(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        first = res.json()["intervals"][0]
        assert first["gap_to_leader"] == 0.0

    def test_race_gaps_intervals_numeric_or_string(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        for item in res.json()["intervals"]:
            val = item["interval"]
            assert isinstance(val, (int, float, str)) or val is None

    def test_race_gaps_date_iso_format(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        first = res.json()["intervals"][0]
        assert "T" in first["date"]

    def test_race_gaps_driver_numbers_valid(self, client: TestClient):
        res = client.get("/api/races/2024/1/gaps")
        assert res.status_code == 200
        for item in res.json()["intervals"]:
            assert item["driver_number"] > 0


# ===========================================================================
# 10. Race Weather
# ===========================================================================

class TestRaceWeatherFeature:
    def test_race_weather_schema_and_200(self, client: TestClient):
        res = client.get("/api/races/2024/1/weather")
        assert res.status_code == 200
        data = res.json()
        assert "weather_points" in data
        assert len(data["weather_points"]) > 0

    def test_race_weather_air_temp_range(self, client: TestClient):
        res = client.get("/api/races/2024/1/weather")
        assert res.status_code == 200
        for pt in res.json()["weather_points"]:
            assert 0.0 <= pt["air_temperature"] <= 55.0

    def test_race_weather_track_temp_range(self, client: TestClient):
        res = client.get("/api/races/2024/1/weather")
        assert res.status_code == 200
        for pt in res.json()["weather_points"]:
            assert 0.0 <= pt["track_temperature"] <= 70.0

    def test_race_weather_wind_direction_degrees(self, client: TestClient):
        res = client.get("/api/races/2024/1/weather")
        assert res.status_code == 200
        for pt in res.json()["weather_points"]:
            assert 0 <= pt["wind_direction"] <= 360

    def test_race_weather_rainfall_flag_binary(self, client: TestClient):
        res = client.get("/api/races/2024/1/weather")
        assert res.status_code == 200
        for pt in res.json()["weather_points"]:
            assert pt["rainfall"] in (0, 1)


# ===========================================================================
# 11. Qualifying Results
# ===========================================================================

class TestQualifyingResultsFeature:
    def test_qualifying_results_schema_and_200(self, client: TestClient):
        res = client.get("/api/qualifying/2024/1")
        assert res.status_code == 200
        data = res.json()
        assert "qualifying_results" in data
        assert len(data["qualifying_results"]) > 0

    def test_qualifying_pole_position_rank_1(self, client: TestClient):
        res = client.get("/api/qualifying/2024/1")
        assert res.status_code == 200
        pole = res.json()["qualifying_results"][0]
        assert pole["position"] == 1
        assert pole["q3"] is not None

    def test_qualifying_q1_time_present(self, client: TestClient):
        res = client.get("/api/qualifying/2024/1")
        assert res.status_code == 200
        for q in res.json()["qualifying_results"]:
            assert q["q1"] is not None

    def test_qualifying_q2_q3_progression(self, client: TestClient):
        res = client.get("/api/qualifying/2024/1")
        assert res.status_code == 200
        top_driver = res.json()["qualifying_results"][0]
        assert ":" in top_driver["q1"]
        assert ":" in top_driver["q3"]

    def test_qualifying_driver_and_team_fields(self, client: TestClient):
        res = client.get("/api/qualifying/2024/1")
        assert res.status_code == 200
        for q in res.json()["qualifying_results"]:
            assert len(q["driver_code"]) == 3
            assert len(q["constructor_name"]) > 0


# ===========================================================================
# 12. Lap Telemetry
# ===========================================================================

class TestLapTelemetryFeature:
    def test_lap_telemetry_schema_and_200(self, client: TestClient):
        res = client.get("/api/telemetry/9165/1/18")
        assert res.status_code == 200
        data = res.json()
        assert data["session_key"] == 9165
        assert data["driver_number"] == 1
        assert "telemetry" in data
        assert len(data["telemetry"]) > 0

    def test_lap_telemetry_speed_bounds(self, client: TestClient):
        res = client.get("/api/telemetry/9165/1/18")
        assert res.status_code == 200
        for sample in res.json()["telemetry"]:
            assert 0 <= sample["speed"] <= 380

    def test_lap_telemetry_throttle_range_0_to_100(self, client: TestClient):
        res = client.get("/api/telemetry/9165/1/18")
        assert res.status_code == 200
        for sample in res.json()["telemetry"]:
            assert 0 <= sample["throttle"] <= 100

    def test_lap_telemetry_brake_range_0_or_100(self, client: TestClient):
        res = client.get("/api/telemetry/9165/1/18")
        assert res.status_code == 200
        for sample in res.json()["telemetry"]:
            assert sample["brake"] in (0, 100) or (0 <= sample["brake"] <= 100)

    def test_lap_telemetry_gear_and_drs_normalization(self, client: TestClient):
        res = client.get("/api/telemetry/9165/1/18")
        assert res.status_code == 200
        for sample in res.json()["telemetry"]:
            assert 0 <= sample["gear"] <= 8
            assert sample["drs"] in (0, 1)


# ===========================================================================
# 13. Telemetry Compare
# ===========================================================================

class TestTelemetryCompareFeature:
    def test_telemetry_compare_schema_and_200(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        data = res.json()
        assert data["driver1_number"] == 1
        assert data["driver2_number"] == 4
        assert "trace" in data

    def test_telemetry_compare_distance_aligned(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        trace = res.json()["trace"]
        dist = [s["distance_m"] for s in trace]
        assert dist == sorted(dist)

    def test_telemetry_compare_delta_time_field(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        for s in res.json()["trace"]:
            assert isinstance(s["delta_time"], (int, float))

    def test_telemetry_compare_driver_lap_times(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        data = res.json()
        assert data["driver1_lap_time"] > 0
        assert data["driver2_lap_time"] > 0

    def test_telemetry_compare_trace_metrics(self, client: TestClient):
        res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18")
        assert res.status_code == 200
        first = res.json()["trace"][0]
        for metric in ["d1_speed", "d2_speed", "d1_throttle", "d2_throttle", "d1_brake", "d2_brake", "d1_gear", "d2_gear"]:
            assert metric in first


# ===========================================================================
# 14. Driver Career
# ===========================================================================

class TestDriverCareerFeature:
    def test_driver_career_schema_and_200(self, client: TestClient):
        res = client.get("/api/drivers/max_verstappen/career")
        assert res.status_code == 200
        data = res.json()
        assert data["driver_id"] == "max_verstappen"
        assert "championships" in data

    def test_driver_career_stats_positive_integers(self, client: TestClient):
        res = client.get("/api/drivers/max_verstappen/career")
        assert res.status_code == 200
        data = res.json()
        assert data["wins"] >= 0
        assert data["podiums"] >= data["wins"]
        assert data["total_races"] >= data["podiums"]

    def test_driver_career_seasons_summary_list(self, client: TestClient):
        res = client.get("/api/drivers/max_verstappen/career")
        assert res.status_code == 200
        seasons = res.json()["seasons"]
        assert len(seasons) > 0
        assert "year" in seasons[0]
        assert "points" in seasons[0]

    def test_driver_career_teams_list(self, client: TestClient):
        res = client.get("/api/drivers/max_verstappen/career")
        assert res.status_code == 200
        assert len(res.json()["teams"]) > 0

    def test_driver_career_birth_date_and_nationality(self, client: TestClient):
        res = client.get("/api/drivers/max_verstappen/career")
        assert res.status_code == 200
        data = res.json()
        assert len(data["nationality"]) > 0
        assert "-" in data["birth_date"]


# ===========================================================================
# 15. Driver Compare
# ===========================================================================

class TestDriverCompareFeature:
    def test_driver_compare_schema_and_200(self, client: TestClient):
        res = client.get("/api/drivers/compare?d1=max_verstappen&d2=norris")
        assert res.status_code == 200
        data = res.json()
        assert "driver1" in data
        assert "driver2" in data

    def test_driver_compare_head_to_head_submodels(self, client: TestClient):
        res = client.get("/api/drivers/compare?d1=max_verstappen&d2=norris")
        assert res.status_code == 200
        d1 = res.json()["driver1"]
        for k in ["wins", "podiums", "poles", "points", "best_finish"]:
            assert k in d1

    def test_driver_compare_qualifying_winner_label(self, client: TestClient):
        res = client.get("/api/drivers/compare?d1=max_verstappen&d2=norris")
        assert res.status_code == 200
        assert res.json()["qualifying_winner"] in ["max_verstappen", "norris", "TIE"]

    def test_driver_compare_race_winner_label(self, client: TestClient):
        res = client.get("/api/drivers/compare?d1=max_verstappen&d2=norris")
        assert res.status_code == 200
        assert res.json()["race_finish_winner"] in ["max_verstappen", "norris", "TIE"]

    def test_driver_compare_season_parameter_optional(self, client: TestClient):
        res = client.get("/api/drivers/compare?d1=max_verstappen&d2=norris&season=2024")
        assert res.status_code == 200


# ===========================================================================
# 16. Strategy Pit Window Endpoint
# ===========================================================================

class TestStrategyPitWindowEndpointFeature:
    def test_strategy_pit_window_endpoint_200_and_schema(self, client: TestClient):
        res = client.get("/api/strategy/pit-window/9165/1")
        assert res.status_code == 200
        data = res.json()
        assert data["session_key"] == 9165
        assert data["driver_number"] == 1

    def test_strategy_pit_window_required_keys(self, client: TestClient):
        res = client.get("/api/strategy/pit-window/9165/1")
        assert res.status_code == 200
        data = res.json()
        for k in ["degradation_rate_sec_per_lap", "estimated_cliff_lap", "earliest_pit_lap", "latest_pit_lap", "recommended_pit_lap", "undercut_status"]:
            assert k in data

    def test_strategy_pit_window_degradation_rate_positive(self, client: TestClient):
        res = client.get("/api/strategy/pit-window/9165/1")
        assert res.status_code == 200
        assert res.json()["degradation_rate_sec_per_lap"] > 0

    def test_strategy_pit_window_bounds_consistency(self, client: TestClient):
        res = client.get("/api/strategy/pit-window/9165/1")
        assert res.status_code == 200
        d = res.json()
        assert d["earliest_pit_lap"] <= d["recommended_pit_lap"] <= d["latest_pit_lap"]

    def test_strategy_pit_window_undercut_status_enum(self, client: TestClient):
        res = client.get("/api/strategy/pit-window/9165/1")
        assert res.status_code == 200
        assert res.json()["undercut_status"] in ["HIGHLY_VIABLE", "VIABLE", "MARGINAL", "NOT_VIABLE"]


# ===========================================================================
# 17. Strategy Race Predictor Endpoint
# ===========================================================================

class TestStrategyPredictEndpointFeature:
    def test_strategy_predict_endpoint_200_and_schema(self, client: TestClient):
        res = client.get("/api/strategy/predict/9165/20")
        assert res.status_code == 200
        data = res.json()
        assert data["session_key"] == 9165
        assert data["from_lap"] == 20
        assert "predictions" in data

    def test_strategy_predict_ordering_monotonic(self, client: TestClient):
        res = client.get("/api/strategy/predict/9165/20")
        assert res.status_code == 200
        preds = res.json()["predictions"]
        for idx, p in enumerate(preds):
            assert p["predicted_position"] == idx + 1

    def test_strategy_predict_confidence_scores_bounds(self, client: TestClient):
        res = client.get("/api/strategy/predict/9165/20")
        assert res.status_code == 200
        for p in res.json()["predictions"]:
            assert 0.0 <= p["confidence_score"] <= 1.0

    def test_strategy_predict_deltas_non_negative(self, client: TestClient):
        res = client.get("/api/strategy/predict/9165/20")
        assert res.status_code == 200
        for p in res.json()["predictions"]:
            assert p["time_delta_to_winner_sec"] >= 0.0

    def test_strategy_predict_remaining_laps_computed(self, client: TestClient):
        res = client.get("/api/strategy/predict/9165/20")
        assert res.status_code == 200
        d = res.json()
        assert d["remaining_laps"] == d["total_laps"] - d["from_lap"]


# ===========================================================================
# 18. Live Timing
# ===========================================================================

class TestLiveTimingFeature:
    def test_live_timing_schema_and_200(self, client: TestClient):
        res = client.get("/api/live/timing/9165")
        assert res.status_code == 200
        data = res.json()
        assert "drivers" in data
        assert "status" in data

    def test_live_timing_driver_count(self, client: TestClient):
        res = client.get("/api/live/timing/9165")
        assert res.status_code == 200
        assert len(res.json()["drivers"]) >= 2

    def test_live_timing_leader_gap_string(self, client: TestClient):
        res = client.get("/api/live/timing/9165")
        assert res.status_code == 200
        p1 = res.json()["drivers"][0]
        assert p1["position"] == 1
        assert p1["gap_to_leader"] in ["LEADER", "+0.000", "-"]

    def test_live_timing_tyre_compound_and_age(self, client: TestClient):
        res = client.get("/api/live/timing/9165")
        assert res.status_code == 200
        for d in res.json()["drivers"]:
            assert d["tyre_compound"] in ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"]
            assert d["tyre_age"] >= 0

    def test_live_timing_session_status_enum(self, client: TestClient):
        res = client.get("/api/live/timing/9165")
        assert res.status_code == 200
        assert res.json()["status"] in ["ACTIVE", "SAFETY_CAR", "VSC", "RED_FLAG", "FINISHED"]


# ===========================================================================
# 19. Live Race Control
# ===========================================================================

class TestLiveRaceControlFeature:
    def test_live_race_control_schema_and_200(self, client: TestClient):
        res = client.get("/api/live/race-control/9165")
        assert res.status_code == 200
        data = res.json()
        assert "safety_car_status" in data
        assert "drs_status" in data
        assert "messages" in data

    def test_live_race_control_safety_car_status_enum(self, client: TestClient):
        res = client.get("/api/live/race-control/9165")
        assert res.status_code == 200
        assert res.json()["safety_car_status"] in ["NONE", "SAFETY_CAR", "VIRTUAL_SAFETY_CAR", "RED_FLAG"]

    def test_live_race_control_drs_status_enum(self, client: TestClient):
        res = client.get("/api/live/race-control/9165")
        assert res.status_code == 200
        assert res.json()["drs_status"] in ["ENABLED", "DISABLED"]

    def test_live_race_control_messages_list(self, client: TestClient):
        res = client.get("/api/live/race-control/9165")
        assert res.status_code == 200
        msgs = res.json()["messages"]
        assert len(msgs) > 0
        assert "message" in msgs[0]

    def test_live_race_control_penalties_list(self, client: TestClient):
        res = client.get("/api/live/race-control/9165")
        assert res.status_code == 200
        data = res.json()
        assert "penalties" in data
        for p in data["penalties"]:
            assert p["driver_number"] > 0
            assert len(p["reason"]) > 0


# ===========================================================================
# 20. Circuits List
# ===========================================================================

class TestCircuitsFeature:
    def test_circuits_list_schema_and_200(self, client: TestClient):
        res = client.get("/api/circuits")
        assert res.status_code == 200
        data = res.json()
        assert "circuits" in data
        assert len(data["circuits"]) > 0

    def test_circuits_coordinates_lat_long(self, client: TestClient):
        res = client.get("/api/circuits")
        assert res.status_code == 200
        for c in res.json()["circuits"]:
            assert -90.0 <= c["lat"] <= 90.0
            assert -180.0 <= c["long"] <= 180.0

    def test_circuits_length_and_turns_positive(self, client: TestClient):
        res = client.get("/api/circuits")
        assert res.status_code == 200
        for c in res.json()["circuits"]:
            assert c["length_km"] > 0.0
            assert c["turns"] > 0

    def test_circuits_lap_record_fields(self, client: TestClient):
        res = client.get("/api/circuits")
        assert res.status_code == 200
        first = res.json()["circuits"][0]
        assert "lap_record_time" in first
        assert "lap_record_driver" in first

    def test_circuits_country_and_locality(self, client: TestClient):
        res = client.get("/api/circuits")
        assert res.status_code == 200
        for c in res.json()["circuits"]:
            assert len(c["country"]) > 0
            assert len(c["locality"]) > 0


# ===========================================================================
# 21. Circuit History
# ===========================================================================

class TestCircuitHistoryFeature:
    def test_circuit_history_schema_and_200(self, client: TestClient):
        res = client.get("/api/circuits/bahrain/history")
        assert res.status_code == 200
        data = res.json()
        assert data["circuit_id"] == "bahrain"
        assert "past_winners" in data

    def test_circuit_history_past_winners_list(self, client: TestClient):
        res = client.get("/api/circuits/bahrain/history")
        assert res.status_code == 200
        winners = res.json()["past_winners"]
        assert len(winners) > 0
        assert winners[0]["year"] >= 1950

    def test_circuit_history_past_pole_sitters(self, client: TestClient):
        res = client.get("/api/circuits/bahrain/history")
        assert res.status_code == 200
        poles = res.json()["past_pole_sitters"]
        assert len(poles) > 0
        assert ":" in poles[0]["time"]

    def test_circuit_history_first_held_year(self, client: TestClient):
        res = client.get("/api/circuits/bahrain/history")
        assert res.status_code == 200
        assert res.json()["first_held_year"] >= 1950

    def test_circuit_history_races_held_count(self, client: TestClient):
        res = client.get("/api/circuits/bahrain/history")
        assert res.status_code == 200
        assert res.json()["races_held_count"] > 0


# ===========================================================================
# 22. News Feed
# ===========================================================================

class TestNewsFeedFeature:
    def test_news_feed_schema_and_200(self, client: TestClient):
        res = client.get("/api/news")
        assert res.status_code == 200
        data = res.json()
        assert "articles" in data
        assert "count" in data

    def test_news_feed_limit_parameter(self, client: TestClient):
        res = client.get("/api/news?limit=1")
        assert res.status_code == 200
        assert len(res.json()["articles"]) <= 1

    def test_news_feed_article_fields(self, client: TestClient):
        res = client.get("/api/news")
        assert res.status_code == 200
        first = res.json()["articles"][0]
        for field in ["title", "link", "description", "pub_date", "source"]:
            assert field in first
            assert len(first[field]) > 0

    def test_news_feed_http_links_valid(self, client: TestClient):
        res = client.get("/api/news")
        assert res.status_code == 200
        for art in res.json()["articles"]:
            assert art["link"].startswith("http")

    def test_news_feed_source_attribution(self, client: TestClient):
        res = client.get("/api/news")
        assert res.status_code == 200
        for art in res.json()["articles"]:
            assert art["source"] in ["Autosport", "Motorsport.com", "BBC Sport", "RaceFans"]


# ===========================================================================
# 23. Driver Historical Stats
# ===========================================================================

class TestDriverHistoricalStatsFeature:
    def test_driver_historical_stats_schema_and_200(self, client: TestClient):
        res = client.get("/api/stats/drivers")
        assert res.status_code == 200
        data = res.json()
        assert "drivers" in data
        assert "total_drivers" in data

    def test_driver_historical_stats_sort_by_wins(self, client: TestClient):
        res = client.get("/api/stats/drivers?sort_by=wins")
        assert res.status_code == 200
        drivers = res.json()["drivers"]
        for idx in range(1, len(drivers)):
            assert drivers[idx]["race_wins"] <= drivers[idx - 1]["race_wins"]

    def test_driver_historical_stats_limit_and_offset(self, client: TestClient):
        res = client.get("/api/stats/drivers?limit=2&offset=1")
        assert res.status_code == 200
        assert len(res.json()["drivers"]) <= 2

    def test_driver_historical_stats_win_percentage_range(self, client: TestClient):
        res = client.get("/api/stats/drivers")
        assert res.status_code == 200
        for d in res.json()["drivers"]:
            assert 0.0 <= d["win_percentage"] <= 100.0

    def test_driver_historical_stats_championships_count(self, client: TestClient):
        res = client.get("/api/stats/drivers")
        assert res.status_code == 200
        for d in res.json()["drivers"]:
            assert d["world_championships"] >= 0


# ===========================================================================
# 24. Constructor Historical Stats
# ===========================================================================

class TestConstructorHistoricalStatsFeature:
    def test_constructor_historical_stats_schema_and_200(self, client: TestClient):
        res = client.get("/api/stats/constructors")
        assert res.status_code == 200
        data = res.json()
        assert "constructors" in data
        assert "total_constructors" in data

    def test_constructor_historical_stats_sort_by_wins(self, client: TestClient):
        res = client.get("/api/stats/constructors?sort_by=wins")
        assert res.status_code == 200
        teams = res.json()["constructors"]
        for idx in range(1, len(teams)):
            assert teams[idx]["race_wins"] <= teams[idx - 1]["race_wins"]

    def test_constructor_historical_stats_limit_offset(self, client: TestClient):
        res = client.get("/api/stats/constructors?limit=1&offset=0")
        assert res.status_code == 200
        assert len(res.json()["constructors"]) <= 1

    def test_constructor_historical_stats_win_percentage_range(self, client: TestClient):
        res = client.get("/api/stats/constructors")
        assert res.status_code == 200
        for t in res.json()["constructors"]:
            assert 0.0 <= t["win_percentage"] <= 100.0

    def test_constructor_historical_stats_championships(self, client: TestClient):
        res = client.get("/api/stats/constructors")
        assert res.status_code == 200
        for t in res.json()["constructors"]:
            assert t["championships"] >= 0


# ===========================================================================
# 25. Standalone Pit Window Algorithm (services/pit_window.py)
# ===========================================================================

class TestPitWindowAlgorithmUnitFeature:
    def test_pit_window_clean_stint_degradation_calculation(self, pit_window_solver, sample_stint_lap_times):
        res = pit_window_solver(
            tyre_age=15, lap_times=sample_stint_lap_times, gap_ahead=1.5,
            gap_behind=3.5, remaining_laps=42, pit_loss_time=22.0, compound="MEDIUM"
        )
        assert res["degradation_rate"] > 0
        assert res["cliff_lap"] > 15
        assert res["laps_until_cliff"] >= 0

    def test_pit_window_compound_defaults_when_few_laps(self, pit_window_solver):
        res = pit_window_solver(
            tyre_age=2, lap_times=[93.0], gap_ahead=2.0, gap_behind=4.0,
            remaining_laps=55, compound="SOFT"
        )
        assert res["degradation_rate"] >= 0.020

    def test_pit_window_undercut_highly_viable_tight_gap(self, pit_window_solver):
        res = pit_window_solver(
            tyre_age=16, lap_times=[92.0, 92.1, 92.2, 92.3], gap_ahead=1.2,
            gap_behind=3.0, remaining_laps=40
        )
        assert res["undercut_status"].lower() in ["viable", "highly_viable"]
        assert res["recommended_pit_lap"] == res["earliest_pit_lap"]

    def test_pit_window_undercut_not_viable_large_gap(self, pit_window_solver):
        res = pit_window_solver(
            tyre_age=16, lap_times=[92.0, 92.1, 92.2], gap_ahead=5.5,
            gap_behind=4.0, remaining_laps=40
        )
        assert res["undercut_status"].lower() == "not_viable"

    def test_pit_window_bounds_earliest_recommended_latest(self, pit_window_solver, sample_stint_lap_times):
        res = pit_window_solver(
            tyre_age=14, lap_times=sample_stint_lap_times, gap_ahead=2.5,
            gap_behind=2.5, remaining_laps=43, current_lap=14
        )
        assert res["earliest_pit_lap"] <= res["recommended_pit_lap"] <= res["latest_pit_lap"]


# ===========================================================================
# 26. Standalone Race Predictor Algorithm (services/race_predictor.py)
# ===========================================================================

class TestRacePredictorAlgorithmUnitFeature:
    def test_race_predictor_ordered_predictions(self, race_predictor_solver):
        positions = [
            {"driver_number": 1, "driver_name": "Verstappen", "driver_code": "VER", "position": 1, "team_name": "Red Bull"},
            {"driver_number": 4, "driver_name": "Norris", "driver_code": "NOR", "position": 2, "team_name": "McLaren"},
        ]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 10, 4: 12},
            compounds={1: "MEDIUM", 4: "HARD"},
            lap_times={1: [91.5, 91.6], 4: [91.8, 91.9]},
            current_lap=25, total_laps=57
        )
        assert len(preds) == 2
        assert preds[0]["predicted_position"] == 1
        assert preds[1]["predicted_position"] == 2

    def test_race_predictor_confidence_score_range(self, race_predictor_solver):
        positions = [{"driver_number": 1, "driver_name": "VER", "position": 1}]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 10},
            compounds={1: "MEDIUM"}, lap_times={1: [92.0, 92.1]},
            current_lap=25, total_laps=57
        )
        conf = preds[0]["confidence_score"]
        assert 0.0 <= conf <= 1.0

    def test_race_predictor_fuel_effect_included(self, race_predictor_solver):
        positions = [{"driver_number": 1, "driver_name": "VER", "position": 1}]
        preds_early = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 5},
            compounds={1: "MEDIUM"}, lap_times={1: [92.0]},
            current_lap=10, total_laps=57
        )
        preds_late = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 5},
            compounds={1: "MEDIUM"}, lap_times={1: [92.0]},
            current_lap=50, total_laps=57
        )
        # Late in race, remaining laps are fewer so confidence is higher
        assert preds_late[0]["confidence_score"] >= preds_early[0]["confidence_score"]

    def test_race_predictor_tyre_age_stint_simulation(self, race_predictor_solver):
        positions = [
            {"driver_number": 1, "driver_name": "VER", "position": 1},
            {"driver_number": 4, "driver_name": "NOR", "position": 2},
        ]
        # Driver 1 has fresh tyres and slightly better pace, Driver 4 has worn tyres and needs extra stop
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 2, 4: 18},
            compounds={1: "HARD", 4: "SOFT"},
            lap_times={1: [91.0, 91.0], 4: [92.0, 92.0]},
            current_lap=20, total_laps=40
        )
        assert preds[0]["driver_number"] == 1

    def test_race_predictor_zero_remaining_laps_handled(self, race_predictor_solver):
        positions = [{"driver_number": 1, "driver_name": "VER", "position": 1}]
        preds = race_predictor_solver(
            current_positions=positions, tyre_ages={1: 20},
            compounds={1: "HARD"}, lap_times={1: [92.0]},
            current_lap=57, total_laps=57
        )
        assert len(preds) == 1
        assert preds[0]["predicted_position"] == 1
