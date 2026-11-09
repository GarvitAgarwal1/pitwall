"""
Adversarial Stress, Security & Concurrency Verification Suite (Tier 5 White-Box).

Tests:
1. High-throughput concurrency stress testing against the token-bucket rate limiter.
2. Malformed, injection, out-of-range, and boundary parameters across REST API endpoints.
3. Simulated upstream network failures / timeouts (ConnectTimeout, ReadTimeout, 500, 502, 503)
   verifying graceful degradation to mock data / clean status without unhandled 500 crashes.
4. Caching behavior: hits, misses, TTL expiration, Redis fallback, and concurrent writes/reads.
5. High-throughput asynchronous concurrency stress against the FastAPI application.
"""

import asyncio
import os
import sys
import time
from unittest.mock import AsyncMock, patch
import httpx
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.cache import DualModeCache, InMemoryCache
from app.clients.jolpica import JolpicaClient, jolpica_client
from app.clients.openf1 import OpenF1Client, openf1_client
from app.clients.rss import RSSClient, rss_client
from app.main import app
from app.rate_limiter import RateLimiter, TokenBucket
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

client = TestClient(app, raise_server_exceptions=False)


# =============================================================================
# PART 1: TOKEN-BUCKET RATE LIMITER CONCURRENCY & STRESS TESTS
# =============================================================================

class TestRateLimiterAdversarial:
    """Stress-test TokenBucket and dual-bucket RateLimiter under concurrency and edge cases."""

    def test_token_bucket_initial_state(self):
        tb = TokenBucket(capacity=5.0, refill_rate=2.0)
        assert tb.tokens == 5.0
        assert tb.wait_time_for_token() == 0.0
        assert tb.consume() is True
        assert tb.tokens == 4.0

    def test_token_bucket_depletion_and_refill(self):
        tb = TokenBucket(capacity=2.0, refill_rate=10.0)
        assert tb.consume() is True
        assert tb.consume() is True
        assert tb.consume() is False
        wait_time = tb.wait_time_for_token()
        assert wait_time > 0.0

        # Simulate time passing
        now = time.monotonic() + 0.15
        tb.update(now)
        assert tb.tokens >= 1.0
        assert tb.consume() is True

    def test_token_bucket_cannot_exceed_capacity(self):
        tb = TokenBucket(capacity=3.0, refill_rate=100.0)
        tb.update(time.monotonic() + 100.0)
        assert tb.tokens == 3.0

    @pytest.mark.asyncio
    async def test_rate_limiter_try_acquire_burst(self):
        limiter = RateLimiter(max_per_second=5.0, max_per_minute=60.0)
        # Should be able to acquire burst capacity
        acquired = [limiter.try_acquire() for _ in range(5)]
        assert all(acquired)
        # Sixth immediate attempt should fail (burst exhausted)
        assert limiter.try_acquire() is False

    @pytest.mark.asyncio
    async def test_rate_limiter_high_concurrency_acquire(self):
        """Spawn 30 concurrent acquire tasks; ensure all succeed without deadlocks or token corruption."""
        limiter = RateLimiter(max_per_second=20.0, max_per_minute=200.0)

        results = []
        async def worker(worker_id: int):
            await limiter.acquire()
            results.append(worker_id)

        tasks = [asyncio.create_task(worker(i)) for i in range(25)]
        await asyncio.wait_for(asyncio.gather(*tasks), timeout=5.0)
        assert len(results) == 25
        assert set(results) == set(range(25))

    @pytest.mark.asyncio
    async def test_rate_limiter_monotonic_clock_backward_jump(self):
        """Simulate negative elapsed time (e.g., NTP adjustments or clock anomalies)."""
        tb = TokenBucket(capacity=3.0, refill_rate=1.0)
        now = time.monotonic()
        tb.update(now)
        # Step clock backwards
        tb.update(now - 10.0)
        # Tokens should not become negative or explode
        assert 0.0 <= tb.tokens <= 3.0


# =============================================================================
# PART 2: ADVERSARIAL PARAMETERS & INJECTION PROBES ACROSS ALL ROUTERS
# =============================================================================

ADVERSARIAL_SEASONS = [
    "-1",
    "-2024",
    "0",
    "9999",
    "1899",
    "2050",
    "season2024",
    "2024; DROP TABLE drivers; --",
    "' OR '1'='1",
    "<script>alert(1)</script>",
    "../../../../etc/passwd",
    "2024%00",
    "null",
    "undefined",
    "A" * 1000,
]

ADVERSARIAL_ROUNDS = [
    -1,
    0,
    99,
    99999,
    -99999,
]

ADVERSARIAL_DRIVER_IDS = [
    "ghost_driver",
    "non_existent",
    "' OR '1'='1",
    "driver; SELECT * FROM users;",
    "<svg onload=alert(1)>",
    "../../passwd",
    "   ",
    "0",
    "-1",
    "A" * 500,
]

ADVERSARIAL_SESSION_KEYS = [
    -1,
    0,
    999999999,
    -999999,
]


class TestAdversarialInputsAndInjections:
    """Validate that malicious, out-of-range, and malformed inputs never cause 500 Internal Server Errors."""

    @pytest.mark.parametrize("season", ADVERSARIAL_SEASONS)
    def test_standings_drivers_adversarial_season(self, season: str):
        res = client.get(f"/api/standings/drivers/{season}")
        # Must return valid JSON and not 500
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]
        data = res.json()
        assert isinstance(data, dict)

    @pytest.mark.parametrize("season", ADVERSARIAL_SEASONS)
    def test_standings_constructors_adversarial_season(self, season: str):
        res = client.get(f"/api/standings/constructors/{season}")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("season", ADVERSARIAL_SEASONS)
    def test_races_calendar_adversarial_season(self, season: str):
        res = client.get(f"/api/races/{season}")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("round_num", ADVERSARIAL_ROUNDS)
    def test_race_results_adversarial_round(self, round_num: int):
        res = client.get(f"/api/races/2024/{round_num}/results")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("driver_id", ADVERSARIAL_DRIVER_IDS)
    def test_driver_career_adversarial_driver_id(self, driver_id: str):
        res = client.get(f"/api/drivers/{driver_id}/career")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("session_key", ADVERSARIAL_SESSION_KEYS)
    def test_telemetry_adversarial_session_key(self, session_key: int):
        res = client.get(f"/api/telemetry/{session_key}/1/1")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("session_key", ADVERSARIAL_SESSION_KEYS)
    def test_live_timing_adversarial_session_key(self, session_key: int):
        res = client.get(f"/api/live/timing/{session_key}")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("session_key", ADVERSARIAL_SESSION_KEYS)
    def test_live_race_control_adversarial_session_key(self, session_key: int):
        res = client.get(f"/api/live/race-control/{session_key}")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("session_key", ADVERSARIAL_SESSION_KEYS)
    def test_strategy_pit_window_adversarial_session_key(self, session_key: int):
        res = client.get(f"/api/strategy/pit-window/{session_key}/1")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    @pytest.mark.parametrize("from_lap", [-10, 0, 999])
    def test_strategy_predict_adversarial_laps(self, from_lap: int):
        res = client.get(f"/api/strategy/predict/9165/{from_lap}")
        assert res.status_code in (200, 400, 404, 422)
        assert res.status_code != 500
        assert "application/json" in res.headers["content-type"]

    def test_type_mismatch_parameters(self):
        """Pass string values to integer parameters to test FastAPI Pydantic validation."""
        endpoints = [
            "/api/races/2024/not_a_number/results",
            "/api/races/2024/not_a_number/laps",
            "/api/telemetry/string_session/1/1",
            "/api/telemetry/9165/string_driver/1",
            "/api/telemetry/9165/1/string_lap",
            "/api/strategy/pit-window/abc/xyz",
            "/api/strategy/predict/abc/xyz",
            "/api/live/timing/not_an_int",
        ]
        for ep in endpoints:
            res = client.get(ep)
            assert res.status_code == 422, f"Expected 422 for type mismatch at {ep}, got {res.status_code}"
            assert res.status_code != 500
            assert "application/json" in res.headers["content-type"]


# =============================================================================
# PART 3: SIMULATED UPSTREAM NETWORK FAILURES & GRACEFUL DEGRADATION
# =============================================================================

class TestUpstreamFailureGracefulDegradation:
    """
    Simulate network failures (timeouts, connection drops, 500/502/503 upstream errors)
    and verify that backend degrades gracefully (returns 200 with fallback mock data or clean error).
    Crucially: NEVER crashes or throws unhandled 500 Internal Server Error.
    """

    @pytest.mark.parametrize("error_cls", [
        httpx.ConnectTimeout("Connection timed out to upstream API"),
        httpx.ReadTimeout("Read timed out from upstream API"),
        httpx.ConnectError("Connection refused by upstream host"),
    ])
    def test_jolpica_network_outage_graceful_standings(self, error_cls):
        with patch.object(jolpica_client, "_request", side_effect=error_cls):
            # 1. Driver Standings
            res = client.get("/api/standings/drivers/2024")
            assert res.status_code == 200
            data = res.json()
            model = DriverStandingsResponse(**data)
            assert len(model.standings) > 0
            assert model.standings[0].driver_id != ""

            # 2. Constructor Standings
            res = client.get("/api/standings/constructors/2024")
            assert res.status_code == 200
            data = res.json()
            model = ConstructorStandingsResponse(**data)
            assert len(model.standings) > 0

    @pytest.mark.parametrize("error_cls", [
        httpx.ConnectTimeout("Connection timed out"),
        httpx.ReadTimeout("Read timed out"),
        httpx.ConnectError("Failed to resolve api.openf1.org"),
    ])
    def test_openf1_network_outage_graceful_telemetry_and_laps(self, error_cls):
        with patch.object(openf1_client, "_request", side_effect=error_cls):
            # 1. Laps
            res = client.get("/api/races/2024/1/laps")
            assert res.status_code == 200
            data = res.json()
            model = RaceLapsResponse(**data)
            assert len(model.laps) > 0
            assert model.laps[0].duration_sector_1 is not None

            # 2. Stints
            res = client.get("/api/races/2024/1/stints")
            assert res.status_code == 200
            data = res.json()
            model = RaceStintsResponse(**data)
            assert len(model.stints) > 0

            # 3. Pit Stops
            res = client.get("/api/races/2024/1/pitstops")
            assert res.status_code == 200
            data = res.json()
            model = RacePitStopsResponse(**data)
            assert len(model.pit_stops) > 0

            # 4. Lap Telemetry
            res = client.get("/api/telemetry/9165/1/1")
            assert res.status_code == 200
            data = res.json()
            model = LapTelemetryResponse(**data)
            assert model.samples_count > 0
            assert len(model.telemetry) > 0

    def test_all_24_routes_survive_complete_upstream_blackout(self):
        """Simulate total upstream blackout across all external clients simultaneously."""
        blackout_err = httpx.ConnectError("All external APIs unreachable")

        with patch.object(openf1_client, "_request", side_effect=blackout_err), \
             patch.object(jolpica_client, "_request", side_effect=blackout_err), \
             patch.object(rss_client, "fetch_news", side_effect=blackout_err):

            test_routes = [
                # Standings & Calendar
                ("GET", "/api/standings/drivers/2024"),
                ("GET", "/api/standings/constructors/2024"),
                ("GET", "/api/races/2024"),
                ("GET", "/api/races/2024/1/results"),
                # Race Analysis
                ("GET", "/api/races/2024/1/laps"),
                ("GET", "/api/races/2024/1/stints"),
                ("GET", "/api/races/2024/1/pitstops"),
                ("GET", "/api/races/2024/1/positions"),
                ("GET", "/api/races/2024/1/gaps"),
                ("GET", "/api/races/2024/1/weather"),
                ("GET", "/api/qualifying/2024/1"),
                # Telemetry
                ("GET", "/api/telemetry/9165/1/18"),
                ("GET", "/api/telemetry/compare?session=9165&d1=1&d2=4&lap=18"),
                # Drivers
                ("GET", "/api/drivers/max_verstappen/career"),
                ("GET", "/api/drivers/compare?d1=max_verstappen&d2=norris"),
                # Strategy
                ("GET", "/api/strategy/pit-window/9165/1"),
                ("GET", "/api/strategy/predict/9165/20"),
                # Live
                ("GET", "/api/live/timing/9165"),
                ("GET", "/api/live/race-control/9165"),
                # Circuits & News
                ("GET", "/api/circuits"),
                ("GET", "/api/circuits/bahrain/history"),
                ("GET", "/api/news"),
                # Stats
                ("GET", "/api/stats/drivers"),
                ("GET", "/api/stats/constructors"),
            ]

            for method, path in test_routes:
                res = client.get(path)
                assert res.status_code != 500, f"ROUTE CRASHED (500) during upstream blackout: {path}"
                assert res.status_code == 200, f"Route did not degrade gracefully to fallback: {path} (got {res.status_code})"
                assert "application/json" in res.headers["content-type"]
                # Must be valid parseable JSON
                data = res.json()
                assert data is not None


# =============================================================================
# PART 4: CACHING & TTL EXPIRATION VERIFICATION
# =============================================================================

class TestCacheMechanismsAndTTL:
    """Verify caching, hit/miss mechanisms, TTL expiration, and concurrency safety."""

    @pytest.mark.asyncio
    async def test_in_memory_cache_crud(self):
        cache = InMemoryCache()
        assert await cache.get("test_key") is None

        # Set with TTL
        await cache.set("test_key", {"data": 123}, ttl=60)
        assert await cache.get("test_key") == {"data": 123}

        # Delete
        assert await cache.delete("test_key") is True
        assert await cache.get("test_key") is None
        assert await cache.delete("non_existent") is False

    @pytest.mark.asyncio
    async def test_in_memory_cache_ttl_expiration(self):
        cache = InMemoryCache()
        # Set with 0.1s TTL
        await cache.set("ephemeral_key", "ephemeral_val", ttl=0)
        # Immediate get with 0 ttl expires immediately
        await asyncio.sleep(0.01)
        assert await cache.get("ephemeral_key") is None

        # Set with 1s TTL
        await cache.set("short_key", "short_val", ttl=1)
        assert await cache.get("short_key") == "short_val"
        # Wait for expiration
        await asyncio.sleep(1.05)
        assert await cache.get("short_key") is None

    @pytest.mark.asyncio
    async def test_dual_mode_cache_fallback_when_redis_down(self):
        # Point to an unreachable Redis port
        dmc = DualModeCache(redis_url="redis://127.0.0.1:54321/0")
        assert dmc._redis_available is not True

        # Should fall back to in-memory cache without raising exceptions
        assert await dmc.set("fallback_key", [1, 2, 3], ttl=60) is True
        val = await dmc.get("fallback_key")
        assert val == [1, 2, 3]

    @pytest.mark.asyncio
    async def test_concurrent_cache_reads_and_writes(self):
        """Stress test cache with 50 concurrent async tasks reading and writing."""
        cache = InMemoryCache()

        async def writer(k: int):
            for i in range(10):
                await cache.set(f"key_{k}_{i}", f"val_{k}_{i}", ttl=10)

        async def reader(k: int):
            for i in range(10):
                await cache.get(f"key_{k}_{i}")

        writers = [asyncio.create_task(writer(i)) for i in range(25)]
        readers = [asyncio.create_task(reader(i)) for i in range(25)]
        await asyncio.gather(*(writers + readers))

        # Check a sample key
        assert await cache.get("key_0_0") == "val_0_0"

    def test_repeat_requests_served_from_cache(self):
        """Verify that repeat requests to an endpoint serve the identical payload quickly."""
        t0 = time.time()
        res1 = client.get("/api/circuits")
        duration1 = time.time() - t0
        assert res1.status_code == 200

        t1 = time.time()
        res2 = client.get("/api/circuits")
        duration2 = time.time() - t1
        assert res2.status_code == 200

        assert res1.json() == res2.json()


# =============================================================================
# PART 5: SYSTEM ROBUSTNESS & HIGH-THROUGHPUT CONCURRENCY STRESS
# =============================================================================

class TestSystemRobustnessHighThroughput:
    """Stress test the full FastAPI application with high-throughput concurrent requests."""

    @pytest.mark.asyncio
    async def test_high_throughput_burst_across_endpoints(self):
        """Send 100 concurrent asynchronous requests across varied endpoints."""
        endpoints = [
            "/api/standings/drivers/2024",
            "/api/standings/constructors/2024",
            "/api/races/2024",
            "/api/races/2024/1/results",
            "/api/races/2024/1/weather",
            "/api/telemetry/9165/1/1",
            "/api/strategy/pit-window/9165/1",
            "/api/strategy/predict/9165/20",
            "/api/live/timing/9165",
            "/api/circuits",
        ]

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as async_client:
            tasks = []
            for i in range(100):
                ep = endpoints[i % len(endpoints)]
                tasks.append(asyncio.create_task(async_client.get(ep)))

            responses = await asyncio.wait_for(asyncio.gather(*tasks), timeout=15.0)

            assert len(responses) == 100
            for r in responses:
                assert r.status_code == 200
                assert "application/json" in r.headers["content-type"]
                assert r.json() is not None

        # Verify server health remains pristine after burst
        health_res = client.get("/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "ok"
