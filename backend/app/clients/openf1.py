from datetime import datetime, timedelta
import logging
from typing import Any, Dict, List, Optional, Union
import httpx

from app.cache import cache, DualModeCache
from app.config import settings
from app.rate_limiter import openf1_limiter, RateLimiter

logger = logging.getLogger(__name__)


class OpenF1Client:
    """
    Async client for OpenF1 REST API (https://api.openf1.org/v1).
    Enforces rate limiting (3 req/s, 30 req/min) and dual-mode caching.
    Gracefully handles 404 and empty responses by returning empty lists.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        limiter: Optional[RateLimiter] = None,
        cache_client: Optional[DualModeCache] = None,
        timeout: float = 15.0,
    ) -> None:
        self.base_url = (base_url or settings.OPENF1_BASE_URL).rstrip("/")
        self.rate_limiter = limiter or openf1_limiter
        self.cache = cache_client or cache
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={"User-Agent": "PitWall/1.0 (Formula1-Strategy-Dashboard)"},
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "OpenF1Client":
        await self._get_http_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

    async def _request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        ttl: int = 3600,
    ) -> List[Dict[str, Any]]:
        clean_params = {k: v for k, v in (params or {}).items() if v is not None}
        sorted_params = tuple(sorted(clean_params.items()))
        cache_key = f"openf1:{endpoint}:{sorted_params}"

        # 1. Check Cache
        cached = await self.cache.get(cache_key)
        if cached is not None:
            if isinstance(cached, list):
                return cached
            return []

        # 2. Acquire Rate Limiter Token
        await self.rate_limiter.acquire()

        # 3. Perform Request
        client = await self._get_http_client()
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            response = await client.get(url, params=clean_params)
            # OpenF1 returns 404 when 0 records match the query
            if response.status_code == 404:
                logger.debug(f"OpenF1 404 for {url} params={clean_params} (empty result)")
                await self.cache.set(cache_key, [], ttl=min(ttl, 120))
                return []

            response.raise_for_status()
            data = response.json()

            if isinstance(data, list):
                await self.cache.set(cache_key, data, ttl=ttl)
                return data
            elif isinstance(data, dict):
                # Handle possible {"detail": "No results found."}
                if "detail" in data:
                    await self.cache.set(cache_key, [], ttl=min(ttl, 120))
                    return []
                await self.cache.set(cache_key, [data], ttl=ttl)
                return [data]

            return []
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return []
            logger.warning(
                f"OpenF1 HTTP {exc.response.status_code} error fetching {url}: {exc}"
            )
            return []
        except (httpx.RequestError, httpx.TimeoutException) as exc:
            logger.warning(f"OpenF1 network error fetching {url}: {exc}")
            return []
        except Exception as exc:
            logger.warning(f"OpenF1 unexpected error fetching {url}: {exc}")
            return []

    # ------------------ Public Resource Methods ------------------

    async def get_meetings(
        self,
        year: Optional[int] = None,
        country_name: Optional[str] = None,
        circuit_key: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"year": year, "country_name": country_name, "circuit_key": circuit_key}
        return await self._request("meetings", params=params, ttl=86400)

    async def get_sessions(
        self,
        year: Optional[int] = None,
        session_name: Optional[str] = None,
        session_type: Optional[str] = None,
        meeting_key: Optional[int] = None,
        session_key: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {
            "year": year,
            "session_name": session_name,
            "session_type": session_type,
            "meeting_key": meeting_key,
            "session_key": session_key,
        }
        return await self._request("sessions", params=params, ttl=3600)

    async def get_drivers(
        self,
        session_key: Optional[int] = None,
        driver_number: Optional[int] = None,
        meeting_key: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {
            "session_key": session_key,
            "driver_number": driver_number,
            "meeting_key": meeting_key,
        }
        return await self._request("drivers", params=params, ttl=86400)

    async def get_laps(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
        lap_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {
            "session_key": session_key,
            "driver_number": driver_number,
            "lap_number": lap_number,
        }
        return await self._request("laps", params=params, ttl=3600)

    async def get_stints(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "driver_number": driver_number}
        return await self._request("stints", params=params, ttl=3600)

    async def get_pit(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "driver_number": driver_number}
        return await self._request("pit", params=params, ttl=3600)

    async def get_positions(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "driver_number": driver_number}
        return await self._request("position", params=params, ttl=1800)

    async def get_intervals(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "driver_number": driver_number}
        return await self._request("intervals", params=params, ttl=1800)

    async def get_car_data(
        self,
        session_key: int,
        driver_number: int,
        date_start: Optional[Union[str, datetime]] = None,
        date_end: Optional[Union[str, datetime]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Query high-frequency car telemetry (speed, rpm, gear, throttle, brake, drs).
        date_start and date_end bounds constrain the slice to a specific lap or window.
        """
        params: Dict[str, Any] = {
            "session_key": session_key,
            "driver_number": driver_number,
        }
        if date_start is not None:
            params["date>="] = (
                date_start.isoformat()
                if isinstance(date_start, datetime)
                else str(date_start)
            )
        if date_end is not None:
            params["date<="] = (
                date_end.isoformat() if isinstance(date_end, datetime) else str(date_end)
            )
        return await self._request("car_data", params=params, ttl=86400)

    async def get_lap_car_data(
        self,
        session_key: int,
        driver_number: int,
        lap_number: int,
    ) -> List[Dict[str, Any]]:
        """
        Helper method to fetch car_data for a specific lap by resolving lap start & duration.
        """
        laps = await self.get_laps(
            session_key=session_key,
            driver_number=driver_number,
            lap_number=lap_number,
        )
        if not laps:
            return []

        lap = laps[0]
        date_start_str = lap.get("date_start")
        lap_duration = lap.get("lap_duration")

        if not date_start_str:
            return []

        # Calculate end timestamp if duration is available
        date_end_str = None
        if lap_duration:
            try:
                # Handle possible trailing 'Z' or '+00:00'
                clean_start = date_start_str.replace("Z", "+00:00")
                dt_start = datetime.fromisoformat(clean_start)
                dt_end = dt_start + timedelta(seconds=float(lap_duration))
                date_end_str = dt_end.isoformat()
            except Exception as exc:
                logger.debug(f"Could not parse lap date_start '{date_start_str}': {exc}")

        return await self.get_car_data(
            session_key=session_key,
            driver_number=driver_number,
            date_start=date_start_str,
            date_end=date_end_str,
        )

    async def get_weather(self, session_key: int) -> List[Dict[str, Any]]:
        params = {"session_key": session_key}
        return await self._request("weather", params=params, ttl=60)

    async def get_race_control(
        self,
        session_key: int,
        category: Optional[str] = None,
        flag: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "category": category, "flag": flag}
        return await self._request("race_control", params=params, ttl=30)

    async def get_team_radio(
        self,
        session_key: int,
        driver_number: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        params = {"session_key": session_key, "driver_number": driver_number}
        return await self._request("team_radio", params=params, ttl=86400)


# Singleton OpenF1 client instance
openf1_client = OpenF1Client()
