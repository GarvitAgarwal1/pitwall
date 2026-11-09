"""Pydantic v2 schemas for Aggregated F1 News Feed."""

from typing import List, Optional
from pydantic import BaseModel, Field


class NewsArticleItem(BaseModel):
    title: str
    link: str
    description: str
    pub_date: str
    source: str
    thumbnail_url: Optional[str] = None


class NewsFeedResponse(BaseModel):
    count: int
    articles: List[NewsArticleItem]
