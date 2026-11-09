import asyncio
from datetime import datetime, timedelta, timezone
import json
import pytest
from sqlalchemy import select
import httpx

from app.config import Settings, settings, get_settings
from app.database import Base, init_db, fallback_to_sqlite
from app.models.models import Circuit, Driver, Result, CacheEntry
from app.cache import InMemoryCache, DualModeCache
from app.rate_limiter import RateLimiter, TokenBucket
from app.clients.openf1 import OpenF1Client
from app.clients.jolpica import JolpicaClient
from app.clients.rss import RSSClient
from app.services.replay_engine import ReplayEngine, replay_engine


# =====================================================================
# 1. Config Tests
# =====================================================================

def test_config_defaults():
    cfg = Settings()
    assert "sqlite" in cfg.DATABASE_URL
    assert "redis" in cfg.REDIS_URL
    assert cfg.OPENF1_BASE_URL == "https://api.openf1.org/v1"
    assert cfg.JOLPICA_BASE_URL == "https://api.jolpi.ca/ergast/f1"
    assert isinstance(cfg.CORS_ORIGINS, list)
    assert "http://localhost:5173" in cfg.CORS_ORIGINS
    assert get_settings().APP_NAME == "PitWall"


def test_config_cors_parsing(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", '["http://example.com", "http://pitwall.app"]')
    cfg = Settings()
    assert "http://example.com" in cfg.CORS_ORIGINS
    assert "http://pitwall.app" in cfg.CORS_ORIGINS


# =====================================================================
# 2. Database & Models Tests
# =====================================================================

@pytest.mark.asyncio
async def test_database_crud(db_session):
    # 1. Insert Circuit
    circuit = Circuit(
        circuit_id="monza",
        circuit_name="Autodromo Nazionale Monza",
        locality="Monza",
        country="Italy",
        length_km=5.793,
        turns=11,
    )
    db_session.add(circuit)
    await db_session.flush()

    res = await db_session.execute(select(Circuit).where(Circuit.circuit_id == "monza"))
    fetched_circuit = res.scalar_one()
    assert fetched_circuit.circuit_name == "Autodromo Nazionale Monza"

    # 2. Insert Driver
    driver = Driver(
        driver_id="max_verstappen",
        permanent_number=1,
        code="VER",
        first_name="Max",
        last_name="Verstappen",
        nationality="Dutch",
    )
    db_session.add(driver)
    await db_session.flush()

    # 3. Insert Result
    result = Result(
        season=2024,
        round=1,
        driver_id="max_verstappen",
        constructor_id="red_bull",
        grid=1,
        position=1,
        points=25.0,
        laps=57,
        status="Finished",
    )
    db_session.add(result)
    await db_session.flush()

    res = await db_session.execute(
        select(Result).where(Result.driver_id == "max_verstappen")
    )
    fetched_res = res.scalar_one()
    assert fetched_res.points == 25.0
    assert fetched_res.driver.last_name == "Verstappen"

    # 4. Insert CacheEntry
    entry = CacheEntry(
        key="test:cache:key",
        value=json.dumps({"status": "ok"}),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    db_session.add(entry)
    await db_session.flush()

    res = await db_session.execute(
        select(CacheEntry).where(CacheEntry.key == "test:cache:key")
    )
    assert json.loads(res.scalar_one().value) == {"status": "ok"}


@pytest.mark.asyncio
async def test_database_init_db():
    await init_db()
    # Ensure fallback works cleanly
    await fallback_to_sqlite()


# =====================================================================
# 3. Cache Tests
# =====================================================================

@pytest.mark.asyncio
async def test_in_memory_cache_operations(memory_cache):
    # Set and Get
    assert await memory_cache.set("key1", {"data": 123}, ttl=10)
    val = await memory_cache.get("key1")
    assert val == {"data": 123}

    # Delete
    assert await memory_cache.delete("key1")
    assert await memory_cache.get("key1") is None

    # Clear
    await memory_cache.set("key2", "abc", ttl=10)
    await memory_cache.set("key3", "xyz", ttl=10)
    await memory_cache.clear()
    assert await memory_cache.get("key2") is None
    assert await memory_cache.get("key3") is None


@pytest.mark.asyncio
async def test_cache_ttl_expiration(memory_cache):
    # Set with 0 ttl (already expired)
    await memory_cache.set("exp_key", "stale_value", ttl=0)
    await asyncio.sleep(0.01)
    assert await memory_cache.get("exp_key") is None


@pytest.mark.asyncio
async def test_dual_mode_cache_fallback(dual_cache):
    # dual_cache is configured with redis_available=False, using in_memory fallback
    await dual_cache.set("dual_key", [1, 2, 3], ttl=60)
    val = await dual_cache.get("dual_key")
    assert val == [1, 2, 3]
    await dual_cache.delete("dual_key")
    assert await dual_cache.get("dual_key") is None


# =====================================================================
# 4. Rate Limiter Tests
# =====================================================================

def test_token_bucket_mechanics():
    tb = TokenBucket(capacity=3.0, refill_rate=3.0)
    assert tb.consume() is True
    assert tb.consume() is True
    assert tb.consume() is True
    # 4th consume fails immediately
    assert tb.consume() is False
    assert tb.wait_time_for_token() > 0.0


@pytest.mark.asyncio
async def test_rate_limiter_burst_and_sustained(test_rate_limiter):
    # Can acquire burst tokens
    assert test_rate_limiter.try_acquire() is True
    assert test_rate_limiter.try_acquire() is True
    await test_rate_limiter.acquire()


# =====================================================================
# 5. OpenF1 Client Tests
# =====================================================================

@pytest.mark.asyncio
async def test_openf1_get_meetings_and_sessions(dual_cache, test_rate_limiter):
    mock_meetings = [{"meeting_key": 1234, "meeting_name": "Bahrain Grand Prix", "year": 2024}]
    mock_sessions = [{"session_key": 9472, "session_name": "Race", "year": 2024}]

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "meetings" in url_str:
            return httpx.Response(200, json=mock_meetings)
        elif "sessions" in url_str:
            return httpx.Response(200, json=mock_sessions)
        return httpx.Response(404, json={"detail": "No results found."})

    transport = httpx.MockTransport(handler)
    client = OpenF1Client(limiter=test_rate_limiter, cache_client=dual_cache)
    client._client = httpx.AsyncClient(transport=transport)

    meetings = await client.get_meetings(year=2024)
    assert len(meetings) == 1
    assert meetings[0]["meeting_name"] == "Bahrain Grand Prix"

    sessions = await client.get_sessions(year=2024, session_name="Race")
    assert len(sessions) == 1
    assert sessions[0]["session_key"] == 9472

    await client.close()


@pytest.mark.asyncio
async def test_openf1_404_empty_handling(dual_cache, test_rate_limiter):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(404, json={"detail": "No results found."})

    transport = httpx.MockTransport(handler)
    client = OpenF1Client(limiter=test_rate_limiter, cache_client=dual_cache)
    client._client = httpx.AsyncClient(transport=transport)

    pit_stops = await client.get_pit(session_key=9472, driver_number=1)
    assert pit_stops == []

    radio = await client.get_team_radio(session_key=9472)
    assert radio == []

    await client.close()


@pytest.mark.asyncio
async def test_openf1_time_sliced_car_data(dual_cache, test_rate_limiter):
    mock_laps = [
        {
            "session_key": 9472,
            "driver_number": 1,
            "lap_number": 5,
            "date_start": "2024-03-02T15:10:00.000000+00:00",
            "lap_duration": 94.500,
        }
    ]
    mock_car_data = [
        {"speed": 310, "throttle": 100, "brake": 0, "n_gear": 8, "drs": 12},
        {"speed": 120, "throttle": 0, "brake": 100, "n_gear": 3, "drs": 0},
    ]

    recorded_params = {}

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "laps" in url_str:
            return httpx.Response(200, json=mock_laps)
        elif "car_data" in url_str:
            nonlocal recorded_params
            recorded_params = dict(request.url.params)
            return httpx.Response(200, json=mock_car_data)
        return httpx.Response(404, json={"detail": "Not found"})

    transport = httpx.MockTransport(handler)
    client = OpenF1Client(limiter=test_rate_limiter, cache_client=dual_cache)
    client._client = httpx.AsyncClient(transport=transport)

    telemetry = await client.get_lap_car_data(session_key=9472, driver_number=1, lap_number=5)
    assert len(telemetry) == 2
    assert telemetry[0]["speed"] == 310
    assert "date>=" in recorded_params
    assert "date<=" in recorded_params

    await client.close()


# =====================================================================
# 6. Jolpica Client Tests
# =====================================================================

@pytest.mark.asyncio
async def test_jolpica_standings_and_schedule(dual_cache):
    mock_standings = {
        "MRData": {
            "StandingsTable": {
                "StandingsLists": [
                    {
                        "season": "2024",
                        "DriverStandings": [
                            {"position": "1", "points": "429", "Driver": {"driverId": "max_verstappen"}}
                        ],
                    }
                ]
            }
        }
    }
    mock_schedule = {
        "MRData": {
            "RaceTable": {
                "Races": [
                    {"round": "1", "raceName": "Bahrain Grand Prix", "Circuit": {"circuitId": "bahrain"}}
                ]
            }
        }
    }

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "driverStandings" in url_str:
            return httpx.Response(200, json=mock_standings)
        elif "2024.json" in url_str:
            return httpx.Response(200, json=mock_schedule)
        return httpx.Response(404, json={"MRData": {}})

    transport = httpx.MockTransport(handler)
    client = JolpicaClient(cache_client=dual_cache)
    client._client = httpx.AsyncClient(transport=transport)

    standings = await client.get_driver_standings("2024")
    assert "StandingsTable" in standings

    schedule = await client.get_race_schedule("2024")
    assert len(schedule) == 1
    assert schedule[0]["raceName"] == "Bahrain Grand Prix"

    await client.close()


@pytest.mark.asyncio
async def test_jolpica_driver_career_and_circuit(dual_cache):
    mock_driver_bio = {"MRData": {"DriverTable": {"Drivers": [{"driverId": "alonso", "code": "ALO"}]}}}
    mock_results = {"MRData": {"total": "390", "RaceTable": {"Races": []}}}
    mock_circuit = {"MRData": {"CircuitTable": {"Circuits": [{"circuitId": "silverstone", "circuitName": "Silverstone"}]}}}

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)
        if "drivers/alonso.json" in url_str:
            return httpx.Response(200, json=mock_driver_bio)
        elif "circuits/silverstone.json" in url_str:
            return httpx.Response(200, json=mock_circuit)
        return httpx.Response(200, json=mock_results)

    transport = httpx.MockTransport(handler)
    client = JolpicaClient(cache_client=dual_cache)
    client._client = httpx.AsyncClient(transport=transport)

    career = await client.get_driver_career("alonso")
    assert career["driver"]["driverId"] == "alonso"
    assert career["total_races"] == 390

    circuit = await client.get_circuit("silverstone")
    assert circuit["circuitId"] == "silverstone"

    await client.close()


# =====================================================================
# 7. RSS Client Tests
# =====================================================================

@pytest.mark.asyncio
async def test_rss_xml_parsing(dual_cache):
    xml_sample = """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
            <title>Autosport F1 News</title>
            <item>
                <title><![CDATA[Verstappen takes pole in Bahrain]]></title>
                <link>https://www.autosport.com/f1/news/verstappen-pole/10581234/</link>
                <description><![CDATA[<p>Max Verstappen produced a stunning lap to claim pole position.</p>]]></description>
                <pubDate>Sun, 02 Mar 2024 16:00:00 GMT</pubDate>
                <enclosure url="https://images.autosport.com/pole.jpg" type="image/jpeg" />
            </item>
            <item>
                <title>Ferrari locked out row two</title>
                <link>https://www.autosport.com/f1/news/ferrari-row-two/10581235/</link>
                <description>Charles Leclerc and Carlos Sainz will start third and fourth.</description>
                <pubDate>Sun, 02 Mar 2024 16:30:00 GMT</pubDate>
                <media:content url="https://images.autosport.com/ferrari.jpg" />
            </item>
        </channel>
    </rss>
    """

    client = RSSClient(cache_client=dual_cache)
    articles = client.parse_feed_xml(xml_sample, "Autosport")

    assert len(articles) == 2
    assert articles[0]["title"] == "Verstappen takes pole in Bahrain"
    assert articles[0]["source"] == "Autosport"
    assert articles[0]["image_url"] == "https://images.autosport.com/pole.jpg"
    assert "<p>" not in articles[0]["description"]
    assert articles[1]["image_url"] == "https://images.autosport.com/ferrari.jpg"


@pytest.mark.asyncio
async def test_rss_get_news_aggregation(dual_cache):
    xml_feed1 = """<?xml version="1.0"?>
    <rss version="2.0">
        <channel>
            <item>
                <title>Article 1</title>
                <link>https://example.com/1</link>
                <pubDate>Sun, 02 Mar 2024 10:00:00 GMT</pubDate>
            </item>
        </channel>
    </rss>"""

    xml_feed2 = """<?xml version="1.0"?>
    <rss version="2.0">
        <channel>
            <item>
                <title>Article 2 - Newer</title>
                <link>https://example.com/2</link>
                <pubDate>Sun, 02 Mar 2024 12:00:00 GMT</pubDate>
            </item>
        </channel>
    </rss>"""

    def handler(request: httpx.Request) -> httpx.Response:
        if "feed1" in str(request.url):
            return httpx.Response(200, text=xml_feed1)
        return httpx.Response(200, text=xml_feed2)

    transport = httpx.MockTransport(handler)
    client = RSSClient(
        feeds={"Feed1": "https://example.com/feed1", "Feed2": "https://example.com/feed2"},
        cache_client=dual_cache,
    )
    client._client = httpx.AsyncClient(transport=transport)

    news = await client.get_news(limit=10)
    assert len(news) == 2
    # Newer article should be first
    assert news[0]["title"] == "Article 2 - Newer"

    await client.close()


# =====================================================================
# 8. Replay Engine Tests
# =====================================================================

@pytest.mark.asyncio
async def test_replay_engine_simulation():
    engine = ReplayEngine()

    # Lap 10 simulation
    timing = await engine.get_live_timing(session_key=9472, simulated_lap=10)
    assert timing["current_lap"] == 10
    assert timing["total_laps"] == 57
    assert timing["status"] == "ACTIVE"
    assert len(timing["drivers"]) == 20
    assert timing["drivers"][0]["position"] == 1
    assert timing["drivers"][0]["gap_to_leader"] == "LEADER"
    assert timing["drivers"][1]["position"] == 2
    assert timing["drivers"][1]["gap_to_leader"].startswith("+")

    # Race Control Lap 15 (VSC active)
    rc_vsc = await engine.get_race_control(session_key=9472, simulated_lap=15)
    assert rc_vsc["safety_car_status"] == "VIRTUAL_SAFETY_CAR"
    assert rc_vsc["drs_status"] == "DISABLED"
    assert any("VIRTUAL SAFETY CAR" in m["message"] for m in rc_vsc["messages"])

    # Race Control Lap 45 (Penalty applied)
    rc_penalty = await engine.get_race_control(session_key=9472, simulated_lap=45)
    assert len(rc_penalty["penalties"]) >= 1
    assert rc_penalty["penalties"][0]["driver_number"] == 20
