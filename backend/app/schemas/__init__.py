"""PitWall Pydantic v2 Schemas Package."""

from app.schemas.common import (
    HealthResponse,
    RootResponse,
    ErrorResponse,
)
from app.schemas.standings import (
    DriverStandingItem,
    DriverStandingsResponse,
    ConstructorStandingItem,
    ConstructorStandingsResponse,
    RaceScheduleItem,
    RaceCalendarResponse,
    RaceResultItem,
    RaceResultsResponse,
    LapItem,
    RaceLapsResponse,
    StintItem,
    RaceStintsResponse,
    PitStopItem,
    RacePitStopsResponse,
    DriverLapPosition,
    RacePositionsResponse,
    IntervalItem,
    RaceGapsResponse,
    WeatherItem,
    RaceWeatherResponse,
    QualifyingItem,
    QualifyingResultsResponse,
)
from app.schemas.telemetry import (
    TelemetrySample,
    LapTelemetryResponse,
    CompareSample,
    TelemetryCompareResponse,
)
from app.schemas.strategy import (
    PitWindowResponse,
    PredictedDriverFinish,
    RacePredictionResponse,
)
from app.schemas.live import (
    LiveDriverTiming,
    LiveTimingResponse,
    RaceControlMessage,
    PenaltyItem,
    LiveRaceControlResponse,
)
from app.schemas.stats import (
    DriverSeasonSummary,
    DriverCareerResponse,
    DriverHeadToHead,
    DriversComparisonResponse,
    HistoricalDriverStats,
    DriverStatsResponse,
    HistoricalConstructorStats,
    ConstructorStatsResponse,
)
from app.schemas.circuits import (
    CircuitInfo,
    CircuitsListResponse,
    CircuitWinnerItem,
    CircuitPoleItem,
    CircuitHistoryResponse,
)
from app.schemas.news import (
    NewsArticleItem,
    NewsFeedResponse,
)

__all__ = [
    # Common
    "HealthResponse",
    "RootResponse",
    "ErrorResponse",
    # Standings & Races
    "DriverStandingItem",
    "DriverStandingsResponse",
    "ConstructorStandingItem",
    "ConstructorStandingsResponse",
    "RaceScheduleItem",
    "RaceCalendarResponse",
    "RaceResultItem",
    "RaceResultsResponse",
    "LapItem",
    "RaceLapsResponse",
    "StintItem",
    "RaceStintsResponse",
    "PitStopItem",
    "RacePitStopsResponse",
    "DriverLapPosition",
    "RacePositionsResponse",
    "IntervalItem",
    "RaceGapsResponse",
    "WeatherItem",
    "RaceWeatherResponse",
    "QualifyingItem",
    "QualifyingResultsResponse",
    # Telemetry
    "TelemetrySample",
    "LapTelemetryResponse",
    "CompareSample",
    "TelemetryCompareResponse",
    # Strategy
    "PitWindowResponse",
    "PredictedDriverFinish",
    "RacePredictionResponse",
    # Live
    "LiveDriverTiming",
    "LiveTimingResponse",
    "RaceControlMessage",
    "PenaltyItem",
    "LiveRaceControlResponse",
    # Stats
    "DriverSeasonSummary",
    "DriverCareerResponse",
    "DriverHeadToHead",
    "DriversComparisonResponse",
    "HistoricalDriverStats",
    "DriverStatsResponse",
    "HistoricalConstructorStats",
    "ConstructorStatsResponse",
    # Circuits
    "CircuitInfo",
    "CircuitsListResponse",
    "CircuitWinnerItem",
    "CircuitPoleItem",
    "CircuitHistoryResponse",
    # News
    "NewsArticleItem",
    "NewsFeedResponse",
]
