"""Automated pytest test suite verifying all 24 REST API endpoints for PitWall."""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.schemas.circuits import CircuitHistoryResponse, CircuitsListResponse
from app.schemas.common import HealthResponse, RootResponse
from app.schemas.live import LiveRaceControlResponse, LiveTimingResponse
from app.schemas.news import NewsFeedResponse
from app.schemas.standings import (
    ConstructorStandingsResponse,
    DriverStandingsResponse,
    QualifyingResultsResponse,
    RaceCalendarResponse,
    RaceGapsResponse,
    RaceLapsResponse,
    RacePitStopsResponse,
    RacePositionsResponse,
    RaceResultsResponse,
    RaceStintsResponse,
    RaceWeatherResponse,
)
from app.schemas.stats import (
    ConstructorStatsResponse,
    DriverCareerResponse,
    DriverStatsResponse,
    DriversComparisonResponse,
)
from app.schemas.strategy import PitWindowResponse, RacePredictionResponse
from app.schemas.telemetry import LapTelemetryResponse, TelemetryCompareResponse

client = TestClient(app)


# =====================================================================
# 0. System Endpoints (/ and /health)
# =====================================================================

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    model = RootResponse(**data)
    assert model.status == "online"
    assert "PitWall" in model.message


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    model = HealthResponse(**data)
    assert model.status == "ok"
    assert model.app == "PitWall"


# =====================================================================
# 1. Standings Endpoints (Endpoints 1-2)
# =====================================================================

def test_get_driver_standings():
    res = client.get("/api/standings/drivers/2024")
    assert res.status_code == 200
    data = res.json()
    model = DriverStandingsResponse(**data)
    assert model.season == "2024"
    assert len(model.standings) > 0
    top = model.standings[0]
    assert top.position == 1
    assert top.driver_code != ""
    assert top.constructor_name != ""


def test_get_constructor_standings():
    res = client.get("/api/standings/constructors/2024")
    assert res.status_code == 200
    data = res.json()
    model = ConstructorStandingsResponse(**data)
    assert model.season == "2024"
    assert len(model.standings) > 0
    c1 = model.standings[0]
    assert c1.position == 1
    assert c1.constructor_name != ""


# =====================================================================
# 2. Race & Weekend Endpoints (Endpoints 3-11)
# =====================================================================

def test_get_races_schedule():
    res = client.get("/api/races/2024")
    assert res.status_code == 200
    data = res.json()
    model = RaceCalendarResponse(**data)
    assert model.season == "2024"
    assert len(model.races) > 0
    r1 = model.races[0]
    assert r1.round == 1
    assert r1.race_name != ""
    assert r1.circuit_id != ""


def test_get_race_results():
    res = client.get("/api/races/2024/1/results")
    assert res.status_code == 200
    data = res.json()
    model = RaceResultsResponse(**data)
    assert model.round == 1
    assert len(model.results) > 0
    assert model.results[0].position == 1
    assert model.results[0].driver_name != ""


def test_get_race_laps():
    # Without filter
    res = client.get("/api/races/2024/1/laps")
    assert res.status_code == 200
    data = res.json()
    model = RaceLapsResponse(**data)
    assert len(model.laps) > 0

    # With driver_number and lap_number query parameters
    res_filtered = client.get("/api/races/2024/1/laps?driver_number=1&lap_number=5")
    assert res_filtered.status_code == 200
    data_filtered = res_filtered.json()
    model_filtered = RaceLapsResponse(**data_filtered)
    assert len(model_filtered.laps) > 0
    for lap in model_filtered.laps:
        assert lap.driver_number == 1
        assert lap.lap_number == 5


def test_get_race_stints():
    res = client.get("/api/races/2024/1/stints")
    assert res.status_code == 200
    data = res.json()
    model = RaceStintsResponse(**data)
    assert len(model.stints) > 0

    # Filtered by driver_number
    res_filtered = client.get("/api/races/2024/1/stints?driver_number=1")
    assert res_filtered.status_code == 200
    data_filtered = res_filtered.json()
    model_filtered = RaceStintsResponse(**data_filtered)
    assert all(s.driver_number == 1 for s in model_filtered.stints)


def test_get_race_pitstops():
    res = client.get("/api/races/2024/1/pitstops")
    assert res.status_code == 200
    data = res.json()
    model = RacePitStopsResponse(**data)
    assert len(model.pit_stops) > 0
    stop = model.pit_stops[0]
    assert stop.stop_number >= 1
    assert stop.lap >= 1


def test_get_race_positions():
    res = client.get("/api/races/2024/1/positions")
    assert res.status_code == 200
    data = res.json()
    model = RacePositionsResponse(**data)
    assert len(model.positions) > 0
    assert model.positions[0].position >= 1


def test_get_race_gaps():
    res = client.get("/api/races/2024/1/gaps")
    assert res.status_code == 200
    data = res.json()
    model = RaceGapsResponse(**data)
    assert len(model.intervals) > 0

    # With driver_numbers filter
    res_filtered = client.get("/api/races/2024/1/gaps?driver_numbers=1&driver_numbers=11")
    assert res_filtered.status_code == 200
    model_filtered = RaceGapsResponse(**res_filtered.json())
    assert all(i.driver_number in (1, 11) for i in model_filtered.intervals)


def test_get_race_weather():
    res = client.get("/api/races/2024/1/weather")
    assert res.status_code == 200
    data = res.json()
    model = RaceWeatherResponse(**data)
    assert len(model.weather_points) > 0
    wp = model.weather_points[0]
    assert wp.air_temperature > 0
    assert wp.track_temperature > 0


def test_get_qualifying_results():
    res = client.get("/api/qualifying/2024/1")
    assert res.status_code == 200
    data = res.json()
    model = QualifyingResultsResponse(**data)
    assert len(model.qualifying_results) > 0
    q1 = model.qualifying_results[0]
    assert q1.position == 1
    assert q1.driver_name != ""


# =====================================================================
# 3. Telemetry Endpoints (Endpoints 12-13)
# =====================================================================

def test_get_lap_telemetry():
    res = client.get("/api/telemetry/9165/1/15")
    assert res.status_code == 200
    data = res.json()
    model = LapTelemetryResponse(**data)
    assert model.session_key == 9165
    assert model.driver_number == 1
    assert model.lap_number == 15
    assert model.samples_count > 0
    sample = model.telemetry[0]
    assert sample.speed >= 0
    assert 0 <= sample.throttle <= 100
    assert sample.drs in (0, 1)


def test_get_telemetry_compare():
    res = client.get("/api/telemetry/compare?session=9165&d1=1&d2=16&lap=15")
    assert res.status_code == 200
    data = res.json()
    model = TelemetryCompareResponse(**data)
    assert model.session_key == 9165
    assert model.driver1_number == 1
    assert model.driver2_number == 16
    assert len(model.trace) > 0
    pt = model.trace[0]
    assert hasattr(pt, "delta_time")
    assert hasattr(pt, "d1_speed")
    assert hasattr(pt, "d2_speed")


def test_telemetry_compare_missing_params():
    # Missing required query params should return 422 Unprocessable Entity
    res = client.get("/api/telemetry/compare?session=9165")
    assert res.status_code == 422


# =====================================================================
# 4. Drivers & Head-to-Head (Endpoints 14-15)
# =====================================================================

def test_get_driver_career_verstappen():
    res = client.get("/api/drivers/max_verstappen/career")
    assert res.status_code == 200
    data = res.json()
    model = DriverCareerResponse(**data)
    assert model.driver_id == "max_verstappen"
    assert model.wins >= 50
    assert model.championships >= 3
    assert len(model.seasons) > 0


def test_get_driver_career_hamilton():
    res = client.get("/api/drivers/hamilton/career")
    assert res.status_code == 200
    data = res.json()
    model = DriverCareerResponse(**data)
    assert model.driver_id == "hamilton"
    assert model.championships == 7
    assert model.wins >= 100


def test_compare_drivers():
    res = client.get("/api/drivers/compare?d1=norris&d2=verstappen&season=2024")
    assert res.status_code == 200
    data = res.json()
    model = DriversComparisonResponse(**data)
    assert model.driver1.driver_id == "norris"
    assert model.driver2.driver_id == "verstappen"
    assert model.qualifying_winner != ""
    assert model.race_finish_winner != ""
    assert model.points_winner != ""


# =====================================================================
# 5. Strategy Algorithms Endpoints (Endpoints 16-17)
# =====================================================================

def test_get_strategy_pit_window():
    res = client.get("/api/strategy/pit-window/9165/1?tyre_age=16&compound=MEDIUM&gap_ahead=1.45")
    assert res.status_code == 200
    data = res.json()
    model = PitWindowResponse(**data)
    assert model.driver_number == 1
    assert model.degradation_rate_sec_per_lap > 0
    assert model.earliest_pit_lap <= model.recommended_pit_lap <= model.latest_pit_lap
    assert model.undercut_status in ("HIGHLY_VIABLE", "VIABLE", "MARGINAL", "NOT_VIABLE")
    assert model.explanation != ""


def test_get_strategy_predict():
    res = client.get("/api/strategy/predict/9165/20?total_laps=57")
    assert res.status_code == 200
    data = res.json()
    model = RacePredictionResponse(**data)
    assert model.from_lap == 20
    assert model.total_laps == 57
    assert model.remaining_laps == 37
    assert len(model.predictions) > 0
    # Predictions must be ordered by predicted position 1..N
    assert model.predictions[0].predicted_position == 1
    assert 0.0 <= model.predictions[0].confidence_score <= 1.0


# =====================================================================
# 6. Live Timing & Race Control (Endpoints 18-19)
# =====================================================================

def test_get_live_timing():
    res = client.get("/api/live/timing/9165?simulated_lap=25")
    assert res.status_code == 200
    data = res.json()
    model = LiveTimingResponse(**data)
    assert model.session_key == 9165
    assert len(model.drivers) in (19, 20)
    p1 = model.drivers[0]
    assert p1.position == 1
    assert p1.gap_to_leader == "LEADER"
    assert p1.driver_name != ""


def test_get_live_race_control():
    res = client.get("/api/live/race-control/9165?simulated_lap=25")
    assert res.status_code == 200
    data = res.json()
    model = LiveRaceControlResponse(**data)
    assert model.session_key == 9165
    assert model.safety_car_status in ("NONE", "SAFETY_CAR", "VIRTUAL_SAFETY_CAR", "RED_FLAG")
    assert model.drs_status in ("ENABLED", "DISABLED")
    assert len(model.messages) > 0


# =====================================================================
# 7. Circuits (Endpoints 20-21)
# =====================================================================

def test_list_circuits():
    res = client.get("/api/circuits?limit=10&offset=0")
    assert res.status_code == 200
    data = res.json()
    model = CircuitsListResponse(**data)
    assert len(model.circuits) > 0
    c = model.circuits[0]
    assert c.circuit_id != ""
    assert c.length_km > 0
    assert c.turns > 0


def test_get_circuit_history():
    res = client.get("/api/circuits/monaco/history")
    assert res.status_code == 200
    data = res.json()
    model = CircuitHistoryResponse(**data)
    assert model.circuit_id == "monaco"
    assert len(model.past_winners) > 0
    assert len(model.past_pole_sitters) > 0


# =====================================================================
# 8. News (Endpoint 22)
# =====================================================================

def test_get_news():
    res = client.get("/api/news?limit=5&source=all")
    assert res.status_code == 200
    data = res.json()
    model = NewsFeedResponse(**data)
    assert model.count == len(model.articles)
    assert model.count > 0
    art = model.articles[0]
    assert art.title != ""
    assert art.source != ""


# =====================================================================
# 9. Historical Statistics (Endpoints 23-24)
# =====================================================================

def test_get_drivers_stats():
    res = client.get("/api/stats/drivers?sort_by=wins&limit=10&offset=0")
    assert res.status_code == 200
    data = res.json()
    model = DriverStatsResponse(**data)
    assert model.total_drivers >= 10
    assert len(model.drivers) == 10
    # Top driver by wins should have > 50 wins
    assert model.drivers[0].race_wins >= 50
    # Sorted descending
    assert model.drivers[0].race_wins >= model.drivers[1].race_wins


def test_get_constructors_stats():
    res = client.get("/api/stats/constructors?sort_by=wins&limit=10&offset=0")
    assert res.status_code == 200
    data = res.json()
    model = ConstructorStatsResponse(**data)
    assert model.total_constructors >= 10
    assert len(model.constructors) == 10
    assert model.constructors[0].race_wins >= 100
    assert model.constructors[0].race_wins >= model.constructors[1].race_wins
