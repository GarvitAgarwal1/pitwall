"""Enrichment Router: Dynamic driver & asset enrichment endpoints."""

from typing import Any, Dict
from fastapi import APIRouter, Path

from app.services.enrichment import enrichment_service, _MEMORY_CACHE

router = APIRouter(prefix="/enrichment", tags=["enrichment"])


@router.get("/driver/{driver_name}")
async def enrich_driver(
    driver_name: str = Path(..., description="Driver full name or code, e.g. 'Rafael Câmara' or 'Ascari'"),
) -> Dict[str, Any]:
    """Fetch enriched portrait, biography, and background dynamically from Wikipedia REST API."""
    return await enrichment_service.get_driver_enrichment(driver_name)


@router.get("/status")
async def enrichment_status() -> Dict[str, Any]:
    """Return status and count of enriched cached driver assets."""
    return {
        "status": "ready",
        "cached_drivers_count": len(_MEMORY_CACHE),
        "source": "Wikimedia / Wikipedia REST Service",
    }
