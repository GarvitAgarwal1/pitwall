"""PitWall API Routers Package."""

from app.routers.circuits import router as circuits_router
from app.routers.drivers import router as drivers_router
from app.routers.live import router as live_router
from app.routers.news import router as news_router
from app.routers.races import router as races_router
from app.routers.standings import router as standings_router
from app.routers.stats import router as stats_router
from app.routers.strategy import router as strategy_router
from app.routers.telemetry import router as telemetry_router

__all__ = [
    "standings_router",
    "races_router",
    "telemetry_router",
    "drivers_router",
    "strategy_router",
    "live_router",
    "circuits_router",
    "news_router",
    "stats_router",
]
