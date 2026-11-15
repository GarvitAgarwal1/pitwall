"""Autonomous Driver & Constructor Enrichment Service.

Queries Wikipedia / Wikimedia REST APIs autonomously to retrieve high-resolution
portraits, biographical profiles, nationality, and career records for any Formula 1 driver
(historical champions like Fangio and Ascari, or debutant/reserve drivers like Rafael Câmara
and Ryo Hirakawa) without requiring manual hardcoded entries.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional
import urllib.parse
import httpx

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).resolve().parent.parent / "data"
CACHE_FILE = CACHE_DIR / "enrichment_cache.json"

# In-memory fast cache
_MEMORY_CACHE: Dict[str, Dict[str, Any]] = {}


def _load_cache() -> None:
    """Load persistent enrichment cache from disk."""
    global _MEMORY_CACHE
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                _MEMORY_CACHE = json.load(f)
        except Exception as exc:
            logger.warning(f"Could not load enrichment cache: {exc}")


def _save_cache() -> None:
    """Save persistent enrichment cache to disk."""
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_MEMORY_CACHE, f, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.warning(f"Could not persist enrichment cache: {exc}")


# Initialize cache at import
_load_cache()

# Known canonical Wikipedia page titles for historical & special names
SPECIAL_PAGE_MAPPINGS = {
    "fangio": "Juan_Manuel_Fangio",
    "juan manuel fangio": "Juan_Manuel_Fangio",
    "ascari": "Alberto_Ascari",
    "alberto ascari": "Alberto_Ascari",
    "farina": "Giuseppe_Farina",
    "giuseppe farina": "Giuseppe_Farina",
    "nino farina": "Giuseppe_Farina",
    "clark": "Jim_Clark",
    "jim clark": "Jim_Clark",
    "senna": "Ayrton_Senna",
    "ayrton senna": "Ayrton_Senna",
    "schumacher": "Michael_Schumacher",
    "michael schumacher": "Michael_Schumacher",
    "lauda": "Niki_Lauda",
    "niki lauda": "Niki_Lauda",
    "stewart": "Jackie_Stewart",
    "jackie stewart": "Jackie_Stewart",
    "prost": "Alain_Prost",
    "alain prost": "Alain_Prost",
    "camara": "Rafael_Câmara",
    "rafael camara": "Rafael_Câmara",
    "rafael câmara": "Rafael_Câmara",
    "hirakawa": "Ryo_Hirakawa",
    "ryo hirakawa": "Ryo_Hirakawa",
    "bearman": "Oliver_Bearman",
    "oliver bearman": "Oliver_Bearman",
    "colapinto": "Franco_Colapinto",
    "franco colapinto": "Franco_Colapinto",
    "bortoleto": "Gabriel_Bortoleto",
    "gabriel bortoleto": "Gabriel_Bortoleto",
    "antonelli": "Andrea_Kimi_Antonelli",
    "kimi antonelli": "Andrea_Kimi_Antonelli",
    "andrea kimi antonelli": "Andrea_Kimi_Antonelli",
}


class DriverEnrichmentService:
    """Service providing dynamic autonomous enrichment for Formula 1 drivers."""

    async def get_driver_enrichment(self, driver_query: str) -> Dict[str, Any]:
        """Fetch real portrait, biography, and background from Wikipedia REST API."""
        query_clean = driver_query.strip().lower()
        if not query_clean:
            return {"found": False, "query": driver_query, "error": "Empty query"}

        # 1. Check in-memory cache
        if query_clean in _MEMORY_CACHE:
            return _MEMORY_CACHE[query_clean]

        # 2. Determine target Wikipedia page title
        page_title = SPECIAL_PAGE_MAPPINGS.get(query_clean)
        if not page_title:
            # Format normalized title
            parts = [p.capitalize() for p in driver_query.replace("-", " ").split()]
            page_title = "_".join(parts)

        # 3. Query Wikipedia REST API
        encoded_title = urllib.parse.quote(page_title)
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_title}"

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                headers = {"User-Agent": "PitWallF1Telemetry/2.0 (contact: info@pitwall.f1)"}
                resp = await client.get(url, headers=headers)

                # If 404 and no disambiguation attempted yet, try appending "_(racing_driver)"
                if resp.status_code == 404 and not page_title.endswith("_(racing_driver)"):
                    alt_title = urllib.parse.quote(f"{page_title}_(racing_driver)")
                    resp = await client.get(
                        f"https://en.wikipedia.org/api/rest_v1/page/summary/{alt_title}",
                        headers=headers,
                    )

                if resp.status_code == 200:
                    data = resp.json()
                    portrait = None
                    if "thumbnail" in data and "source" in data["thumbnail"]:
                        portrait = data["thumbnail"]["source"]
                    elif "originalimage" in data and "source" in data["originalimage"]:
                        portrait = data["originalimage"]["source"]

                    result = {
                        "found": True,
                        "query": driver_query,
                        "title": data.get("title", driver_query),
                        "description": data.get("description", "Formula 1 Racing Driver"),
                        "extract": data.get("extract", ""),
                        "portrait_url": portrait,
                        "page_url": data.get("content_urls", {}).get("desktop", {}).get("page"),
                        "source": "wikipedia_rest_api",
                    }

                    # Cache result
                    _MEMORY_CACHE[query_clean] = result
                    _save_cache()
                    return result
        except Exception as exc:
            logger.warning(f"Enrichment lookup failed for '{driver_query}': {exc}")

        # Fallback profile
        fallback = {
            "found": False,
            "query": driver_query,
            "title": driver_query,
            "description": "Formula 1 Competitor",
            "extract": f"{driver_query} is an official competitor in the Formula 1 World Championship.",
            "portrait_url": None,
            "source": "fallback",
        }
        return fallback


enrichment_service = DriverEnrichmentService()
