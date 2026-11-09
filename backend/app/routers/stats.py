"""Historical Statistics Router: All-Time Drivers and Constructors records (1950-present)."""

import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Query

from app.schemas.stats import (
    ConstructorStatsResponse,
    DriverStatsResponse,
    HistoricalConstructorStats,
    HistoricalDriverStats,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stats", tags=["stats"])

# Curated all-time historical driver records (1950 - present)
ALL_TIME_DRIVERS: List[Dict[str, Any]] = [
    {"driver_id": "hamilton", "driver_name": "Lewis Hamilton", "nationality": "British", "active_years": "2007-present", "world_championships": 7, "race_entries": 356, "race_wins": 105, "podiums": 201, "pole_positions": 104, "fastest_laps": 67, "dnf_count": 32, "dns_count": 0, "win_percentage": 29.49, "podium_percentage": 56.46},
    {"driver_id": "michael_schumacher", "driver_name": "Michael Schumacher", "nationality": "German", "active_years": "1991-2012", "world_championships": 7, "race_entries": 308, "race_wins": 91, "podiums": 155, "pole_positions": 68, "fastest_laps": 77, "dnf_count": 68, "dns_count": 2, "win_percentage": 29.55, "podium_percentage": 50.32},
    {"driver_id": "max_verstappen", "driver_name": "Max Verstappen", "nationality": "Dutch", "active_years": "2015-present", "world_championships": 4, "race_entries": 209, "race_wins": 63, "podiums": 111, "pole_positions": 40, "fastest_laps": 33, "dnf_count": 31, "dns_count": 0, "win_percentage": 30.14, "podium_percentage": 53.11},
    {"driver_id": "vettel", "driver_name": "Sebastian Vettel", "nationality": "German", "active_years": "2007-2022", "world_championships": 4, "race_entries": 300, "race_wins": 53, "podiums": 122, "pole_positions": 57, "fastest_laps": 38, "dnf_count": 44, "dns_count": 1, "win_percentage": 17.67, "podium_percentage": 40.67},
    {"driver_id": "prost", "driver_name": "Alain Prost", "nationality": "French", "active_years": "1980-1993", "world_championships": 4, "race_entries": 202, "race_wins": 51, "podiums": 106, "pole_positions": 33, "fastest_laps": 41, "dnf_count": 55, "dns_count": 3, "win_percentage": 25.25, "podium_percentage": 52.48},
    {"driver_id": "senna", "driver_name": "Ayrton Senna", "nationality": "Brazilian", "active_years": "1984-1994", "world_championships": 3, "race_entries": 162, "race_wins": 41, "podiums": 80, "pole_positions": 65, "fastest_laps": 19, "dnf_count": 55, "dns_count": 1, "win_percentage": 25.31, "podium_percentage": 49.38},
    {"driver_id": "alonso", "driver_name": "Fernando Alonso", "nationality": "Spanish", "active_years": "2001-present", "world_championships": 2, "race_entries": 401, "race_wins": 32, "podiums": 106, "pole_positions": 22, "fastest_laps": 26, "dnf_count": 78, "dns_count": 2, "win_percentage": 7.98, "podium_percentage": 26.43},
    {"driver_id": "mansell", "driver_name": "Nigel Mansell", "nationality": "British", "active_years": "1980-1995", "world_championships": 1, "race_entries": 191, "race_wins": 31, "podiums": 59, "pole_positions": 32, "fastest_laps": 30, "dnf_count": 89, "dns_count": 4, "win_percentage": 16.23, "podium_percentage": 30.89},
    {"driver_id": "stewart", "driver_name": "Jackie Stewart", "nationality": "British", "active_years": "1965-1973", "world_championships": 3, "race_entries": 100, "race_wins": 27, "podiums": 43, "pole_positions": 17, "fastest_laps": 15, "dnf_count": 34, "dns_count": 1, "win_percentage": 27.00, "podium_percentage": 43.00},
    {"driver_id": "clark", "driver_name": "Jim Clark", "nationality": "British", "active_years": "1960-1968", "world_championships": 2, "race_entries": 73, "race_wins": 25, "podiums": 32, "pole_positions": 33, "fastest_laps": 28, "dnf_count": 27, "dns_count": 1, "win_percentage": 34.25, "podium_percentage": 43.84},
    {"driver_id": "lauda", "driver_name": "Niki Lauda", "nationality": "Austrian", "active_years": "1971-1985", "world_championships": 3, "race_entries": 177, "race_wins": 25, "podiums": 54, "pole_positions": 24, "fastest_laps": 24, "dnf_count": 81, "dns_count": 6, "win_percentage": 14.12, "podium_percentage": 30.51},
    {"driver_id": "fangio", "driver_name": "Juan Manuel Fangio", "nationality": "Argentine", "active_years": "1950-1958", "world_championships": 5, "race_entries": 52, "race_wins": 24, "podiums": 35, "pole_positions": 29, "fastest_laps": 23, "dnf_count": 13, "dns_count": 1, "win_percentage": 46.15, "podium_percentage": 67.31},
    {"driver_id": "piquet", "driver_name": "Nelson Piquet", "nationality": "Brazilian", "active_years": "1978-1991", "world_championships": 3, "race_entries": 207, "race_wins": 23, "podiums": 60, "pole_positions": 24, "fastest_laps": 23, "dnf_count": 87, "dns_count": 3, "win_percentage": 11.11, "podium_percentage": 28.99},
    {"driver_id": "rosberg", "driver_name": "Nico Rosberg", "nationality": "German", "active_years": "2006-2016", "world_championships": 1, "race_entries": 206, "race_wins": 23, "podiums": 57, "pole_positions": 30, "fastest_laps": 20, "dnf_count": 31, "dns_count": 0, "win_percentage": 11.17, "podium_percentage": 27.67},
    {"driver_id": "raikkonen", "driver_name": "Kimi Räikkönen", "nationality": "Finnish", "active_years": "2001-2021", "world_championships": 1, "race_entries": 353, "race_wins": 21, "podiums": 103, "pole_positions": 18, "fastest_laps": 46, "dnf_count": 71, "dns_count": 3, "win_percentage": 5.95, "podium_percentage": 29.18},
    {"driver_id": "hakkinen", "driver_name": "Mika Häkkinen", "nationality": "Finnish", "active_years": "1991-2001", "world_championships": 2, "race_entries": 165, "race_wins": 20, "podiums": 51, "pole_positions": 26, "fastest_laps": 25, "dnf_count": 63, "dns_count": 4, "win_percentage": 12.12, "podium_percentage": 30.91},
]

# Curated all-time historical constructor records (1950 - present)
ALL_TIME_CONSTRUCTORS: List[Dict[str, Any]] = [
    {"constructor_id": "ferrari", "constructor_name": "Ferrari", "nationality": "Italian", "active_years": "1950-present", "championships": 16, "race_entries": 1098, "race_wins": 248, "podiums": 825, "pole_positions": 253, "dnf_count": 448, "dns_count": 18, "win_percentage": 22.59},
    {"constructor_id": "mclaren", "constructor_name": "McLaren", "nationality": "British", "active_years": "1966-present", "championships": 8, "race_entries": 968, "race_wins": 188, "podiums": 522, "pole_positions": 163, "dnf_count": 412, "dns_count": 12, "win_percentage": 19.42},
    {"constructor_id": "mercedes", "constructor_name": "Mercedes", "nationality": "German", "active_years": "1954-present", "championships": 8, "race_entries": 317, "race_wins": 128, "podiums": 299, "pole_positions": 140, "dnf_count": 72, "dns_count": 1, "win_percentage": 40.38},
    {"constructor_id": "williams", "constructor_name": "Williams", "nationality": "British", "active_years": "1975-present", "championships": 9, "race_entries": 822, "race_wins": 114, "podiums": 313, "pole_positions": 128, "dnf_count": 395, "dns_count": 14, "win_percentage": 13.87},
    {"constructor_id": "red_bull", "constructor_name": "Red Bull Racing", "nationality": "Austrian", "active_years": "2005-present", "championships": 6, "race_entries": 393, "race_wins": 122, "podiums": 281, "pole_positions": 103, "dnf_count": 110, "dns_count": 3, "win_percentage": 31.04},
    {"constructor_id": "team_lotus", "constructor_name": "Team Lotus", "nationality": "British", "active_years": "1958-1994", "championships": 7, "race_entries": 491, "race_wins": 79, "podiums": 172, "pole_positions": 107, "dnf_count": 279, "dns_count": 19, "win_percentage": 16.09},
    {"constructor_id": "renault", "constructor_name": "Renault", "nationality": "French", "active_years": "1977-2020", "championships": 2, "race_entries": 403, "race_wins": 35, "podiums": 103, "pole_positions": 51, "dnf_count": 178, "dns_count": 6, "win_percentage": 8.68},
    {"constructor_id": "brabham", "constructor_name": "Brabham", "nationality": "British", "active_years": "1962-1992", "championships": 2, "race_entries": 402, "race_wins": 35, "podiums": 124, "pole_positions": 39, "dnf_count": 218, "dns_count": 11, "win_percentage": 8.71},
    {"constructor_id": "benetton", "constructor_name": "Benetton", "nationality": "Italian", "active_years": "1986-2001", "championships": 1, "race_entries": 260, "race_wins": 27, "podiums": 102, "pole_positions": 15, "dnf_count": 128, "dns_count": 4, "win_percentage": 10.38},
    {"constructor_id": "tyrrell", "constructor_name": "Tyrrell", "nationality": "British", "active_years": "1970-1998", "championships": 1, "race_entries": 433, "race_wins": 23, "podiums": 77, "pole_positions": 14, "dnf_count": 232, "dns_count": 9, "win_percentage": 5.31},
]


@router.get("/drivers", response_model=DriverStatsResponse)
async def get_drivers_stats(
    sort_by: str = Query("wins", description="Sort field: 'wins', 'championships', 'podiums', 'poles', 'entries'"),
    limit: int = Query(50, description="Max drivers to return"),
    offset: int = Query(0, description="Pagination offset"),
) -> DriverStatsResponse:
    """Fetch historical all-time drivers championship statistics with sorting and pagination."""
    sort_key_map = {
        "wins": "race_wins",
        "championships": "world_championships",
        "podiums": "podiums",
        "poles": "pole_positions",
        "entries": "race_entries",
        "fastest_laps": "fastest_laps",
    }
    key = sort_key_map.get(sort_by.lower(), "race_wins")

    sorted_drivers = sorted(
        ALL_TIME_DRIVERS,
        key=lambda d: d.get(key, 0),
        reverse=True,
    )
    paginated = sorted_drivers[offset : offset + limit]
    items = [HistoricalDriverStats(**d) for d in paginated]

    return DriverStatsResponse(
        total_drivers=len(ALL_TIME_DRIVERS),
        drivers=items,
    )


@router.get("/constructors", response_model=ConstructorStatsResponse)
async def get_constructors_stats(
    sort_by: str = Query("wins", description="Sort field: 'wins', 'championships', 'podiums', 'poles', 'entries'"),
    limit: int = Query(50, description="Max constructors to return"),
    offset: int = Query(0, description="Pagination offset"),
) -> ConstructorStatsResponse:
    """Fetch historical all-time constructors championship statistics with sorting and pagination."""
    sort_key_map = {
        "wins": "race_wins",
        "championships": "championships",
        "podiums": "podiums",
        "poles": "pole_positions",
        "entries": "race_entries",
    }
    key = sort_key_map.get(sort_by.lower(), "race_wins")

    sorted_constructors = sorted(
        ALL_TIME_CONSTRUCTORS,
        key=lambda c: c.get(key, 0),
        reverse=True,
    )
    paginated = sorted_constructors[offset : offset + limit]
    items = [HistoricalConstructorStats(**c) for c in paginated]

    return ConstructorStatsResponse(
        total_constructors=len(ALL_TIME_CONSTRUCTORS),
        constructors=items,
    )
