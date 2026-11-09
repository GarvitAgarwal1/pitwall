import logging
from typing import Any, Dict, List, Optional
import httpx

from app.cache import cache, DualModeCache
from app.config import settings

logger = logging.getLogger(__name__)


class JolpicaClient:
    """
    Async client for Jolpica Ergast F1 API (https://api.jolpi.ca/ergast/f1).
    Provides access to 1950-present historical F1 data, standings, results,
    circuits, and driver/constructor statistics with caching.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        cache_client: Optional[DualModeCache] = None,
        timeout: float = 15.0,
    ) -> None:
        self.base_url = (base_url or settings.JOLPICA_BASE_URL).rstrip("/")
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

    async def __aenter__(self) -> "JolpicaClient":
        await self._get_http_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

    async def _request(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        ttl: int = 86400,
    ) -> Dict[str, Any]:
        """Make an async GET request with dual-mode caching and error resilience."""
        clean_params = {k: v for k, v in (params or {}).items() if v is not None}
        sorted_params = tuple(sorted(clean_params.items()))
        cache_key = f"jolpica:{path}:{sorted_params}"

        # 1. Check Cache
        cached = await self.cache.get(cache_key)
        if cached is not None:
            if isinstance(cached, dict):
                return cached
            return {}

        # 2. Perform Request
        client = await self._get_http_client()
        clean_path = path.lstrip("/")
        if not clean_path.endswith(".json"):
            clean_path = f"{clean_path}.json"
        url = f"{self.base_url}/{clean_path}"

        try:
            response = await client.get(url, params=clean_params)
            if response.status_code == 404:
                logger.debug(f"Jolpica 404 for {url}")
                return {}

            response.raise_for_status()
            data = response.json()
            mr_data = data.get("MRData", {})
            if isinstance(mr_data, dict):
                await self.cache.set(cache_key, mr_data, ttl=ttl)
                return mr_data

            return {}
        except httpx.HTTPStatusError as exc:
            logger.warning(
                f"Jolpica HTTP {exc.response.status_code} error fetching {url}: {exc}"
            )
            return {}
        except (httpx.RequestError, httpx.TimeoutException) as exc:
            logger.warning(f"Jolpica network error fetching {url}: {exc}")
            return {}
        except Exception as exc:
            logger.warning(f"Jolpica unexpected error fetching {url}: {exc}")
            return {}

    # ------------------ Standings & Schedule ------------------

    async def get_driver_standings(self, season: str = "current") -> Dict[str, Any]:
        """Fetch driver championship standings for a season."""
        path = f"{season}/driverStandings"
        ttl = 3600 if season == "current" else 86400
        return await self._request(path, ttl=ttl)

    async def get_constructor_standings(self, season: str = "current") -> Dict[str, Any]:
        """Fetch constructor championship standings for a season."""
        path = f"{season}/constructorStandings"
        ttl = 3600 if season == "current" else 86400
        return await self._request(path, ttl=ttl)

    async def get_race_schedule(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch race calendar for a season."""
        path = f"{season}"
        ttl = 3600 if season == "current" else 86400
        data = await self._request(path, ttl=ttl)
        race_table = data.get("RaceTable", {})
        return race_table.get("Races", [])

    # ------------------ Race Results & Qualifying ------------------

    async def get_race_results(self, season: str, round_num: int) -> Dict[str, Any]:
        """Fetch classification results for a specific grand prix round."""
        path = f"{season}/{round_num}/results"
        return await self._request(path, ttl=86400)

    async def get_qualifying_results(self, season: str, round_num: int) -> Dict[str, Any]:
        """Fetch qualifying results (Q1, Q2, Q3) for a grand prix."""
        path = f"{season}/{round_num}/qualifying"
        return await self._request(path, ttl=86400)

    async def get_laps(
        self,
        season: str,
        round_num: int,
        lap_num: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch lap timing from Jolpica."""
        path = (
            f"{season}/{round_num}/laps/{lap_num}"
            if lap_num
            else f"{season}/{round_num}/laps"
        )
        data = await self._request(path, params={"limit": 100}, ttl=86400)
        race_table = data.get("RaceTable", {})
        races = race_table.get("Races", [])
        if races:
            return races[0].get("Laps", [])
        return []

    async def get_pitstops(self, season: str, round_num: int) -> List[Dict[str, Any]]:
        """Fetch pit stop timings for a grand prix."""
        path = f"{season}/{round_num}/pitstops"
        data = await self._request(path, params={"limit": 100}, ttl=86400)
        race_table = data.get("RaceTable", {})
        races = race_table.get("Races", [])
        if races:
            return races[0].get("PitStops", [])
        return []

    # ------------------ Circuits ------------------

    async def get_all_circuits(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch list of all F1 circuits."""
        path = "circuits"
        data = await self._request(
            path, params={"limit": limit, "offset": offset}, ttl=86400
        )
        circuit_table = data.get("CircuitTable", {})
        return circuit_table.get("Circuits", [])

    async def get_circuit(self, circuit_id: str) -> Dict[str, Any]:
        """Fetch info for a specific circuit."""
        path = f"circuits/{circuit_id}"
        data = await self._request(path, ttl=86400)
        circuit_table = data.get("CircuitTable", {})
        circuits = circuit_table.get("Circuits", [])
        return circuits[0] if circuits else {}

    async def get_circuit_history(self, circuit_id: str) -> Dict[str, Any]:
        """
        Fetch circuit historical winners and pole sitters.
        Queries /circuits/{id}/results/1.json and /circuits/{id}/qualifying/1.json.
        """
        wins_data = await self._request(
            f"circuits/{circuit_id}/results/1", params={"limit": 100}, ttl=86400
        )
        poles_data = await self._request(
            f"circuits/{circuit_id}/qualifying/1", params={"limit": 100}, ttl=86400
        )

        winners_races = wins_data.get("RaceTable", {}).get("Races", [])
        poles_races = poles_data.get("RaceTable", {}).get("Races", [])

        return {
            "circuit_id": circuit_id,
            "winners": winners_races,
            "poles": poles_races,
        }

    # ------------------ Driver Career & Records ------------------

    async def get_driver(self, driver_id: str) -> Dict[str, Any]:
        """Fetch driver biographical information."""
        path = f"drivers/{driver_id}"
        data = await self._request(path, ttl=86400)
        driver_table = data.get("DriverTable", {})
        drivers = driver_table.get("Drivers", [])
        return drivers[0] if drivers else {}

    async def get_driver_career(self, driver_id: str) -> Dict[str, Any]:
        """
        Fetch driver career statistics: biography, standings history, wins, poles.
        """
        bio = await self.get_driver(driver_id)
        standings_data = await self._request(
            f"drivers/{driver_id}/driverStandings", params={"limit": 100}, ttl=86400
        )
        wins_data = await self._request(
            f"drivers/{driver_id}/results/1", params={"limit": 100}, ttl=86400
        )
        poles_data = await self._request(
            f"drivers/{driver_id}/qualifying/1", params={"limit": 100}, ttl=86400
        )
        results_data = await self._request(
            f"drivers/{driver_id}/results", params={"limit": 100}, ttl=86400
        )

        standings_lists = standings_data.get("StandingsTable", {}).get(
            "StandingsLists", []
        )
        wins_races = wins_data.get("RaceTable", {}).get("Races", [])
        poles_races = poles_data.get("RaceTable", {}).get("Races", [])
        total_races_str = results_data.get("total", "0")

        return {
            "driver": bio,
            "standings_lists": standings_lists,
            "wins": wins_races,
            "poles": poles_races,
            "total_races": int(total_races_str) if total_races_str.isdigit() else len(results_data.get("RaceTable", {}).get("Races", [])),
            "recent_results": results_data.get("RaceTable", {}).get("Races", []),
        }

    async def get_all_drivers(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch historical drivers list."""
        path = "drivers"
        data = await self._request(
            path, params={"limit": limit, "offset": offset}, ttl=86400
        )
        return data.get("DriverTable", {}).get("Drivers", [])

    async def get_all_constructors(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch historical constructors list."""
        path = "constructors"
        data = await self._request(
            path, params={"limit": limit, "offset": offset}, ttl=86400
        )
        return data.get("ConstructorTable", {}).get("Constructors", [])


# Singleton Jolpica client instance
jolpica_client = JolpicaClient()
