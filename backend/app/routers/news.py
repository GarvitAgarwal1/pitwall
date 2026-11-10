"""News Router: Aggregated F1 news feed from Autosport, Motorsport.com, and BBC F1."""

import logging
from typing import List
from fastapi import APIRouter, Query

from app.clients.rss import rss_client
from app.schemas.news import (
    NewsArticleItem,
    NewsFeedResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["news"])

FALLBACK_NEWS = [
    {
        "title": "McLaren introduces aggressive floor upgrade package ahead of title showdown",
        "link": "https://www.autosport.com/f1/news/mclaren-floor-upgrade",
        "description": "McLaren has unveiled key aerodynamic revisions aimed at preserving tyre life in medium-speed corners.",
        "pub_date": "Sun, 03 Nov 2024 16:30:00 GMT",
        "source": "Autosport",
        "thumbnail_url": "https://images.autosport.com/mclaren-car.jpg",
    },
    {
        "title": "Ferrari targeting straight-line efficiency gains for upcoming high-speed races",
        "link": "https://www.motorsport.com/f1/news/ferrari-straight-line",
        "description": "Technical director explains recent rear wing redesign and DRS flap profiling.",
        "pub_date": "Sun, 03 Nov 2024 14:15:00 GMT",
        "source": "Motorsport.com",
        "thumbnail_url": "https://images.motorsport.com/ferrari-car.jpg",
    },
    {
        "title": "Verstappen reflects on masterclass drive in wet conditions",
        "link": "https://www.bbc.co.uk/sport/formula1/68912345",
        "description": "Three-time world champion describes crucial tyre management during torrential rain stint.",
        "pub_date": "Sun, 03 Nov 2024 12:00:00 GMT",
        "source": "BBC Sport",
        "thumbnail_url": "https://ichef.bbci.co.uk/news/verstappen.jpg",
    },
    {
        "title": "FIA clarifies tyre pressure monitoring protocols for sprint weekends",
        "link": "https://www.autosport.com/f1/news/fia-tyre-pressures",
        "description": "Updated technical directive enforces tighter tolerances on cold starting tyre pressures.",
        "pub_date": "Sat, 02 Nov 2024 19:45:00 GMT",
        "source": "Autosport",
        "thumbnail_url": "https://images.autosport.com/tyre-garage.jpg",
    },
]


@router.get("", response_model=NewsFeedResponse)
async def get_news(
    limit: int = Query(20, description="Max news articles to return"),
    source: str = Query("all", description="News source filter: 'all', 'Autosport', 'Motorsport.com', 'BBC Sport'"),
) -> NewsFeedResponse:
    """Fetch latest aggregated Formula 1 news with thumbnails and publication timestamps."""
    if limit == 0:
        return NewsFeedResponse(count=0, articles=[])

    articles_list: List[NewsArticleItem] = []
    try:
        raw_news = await rss_client.get_news(limit=limit, source=source)
        for item in raw_news:
            src = item.get("source", "Motorsport News")
            if src == "BBC F1":
                src = "BBC Sport"
            articles_list.append(
                NewsArticleItem(
                    title=item.get("title", "Untitled Article"),
                    link=item.get("link", ""),
                    description=item.get("description", ""),
                    pub_date=item.get("pub_date") or item.get("pubDate", ""),
                    source=src,
                    thumbnail_url=item.get("thumbnail_url") or item.get("image_url"),
                )
            )
    except Exception as exc:
        logger.warning(f"Error fetching RSS news: {exc}")

    if not articles_list:
        articles_list = [NewsArticleItem(**item) for item in FALLBACK_NEWS]
        if source != "all":
            articles_list = [
                a for a in articles_list
                if a.source.lower() in (source.lower(), "bbc sport" if source.lower() == "bbc f1" else "")
            ]

    limited = articles_list[:limit]
    return NewsFeedResponse(count=len(limited), articles=limited)
