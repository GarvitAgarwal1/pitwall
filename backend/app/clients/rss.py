from email.utils import parsedate_to_datetime
import html
import logging
import re
from typing import Any, Dict, List, Optional
import xml.etree.ElementTree as ET
import httpx

from app.cache import cache, DualModeCache

logger = logging.getLogger(__name__)

DEFAULT_FEEDS = {
    "Autosport": "https://www.autosport.com/rss/f1/news/",
    "Motorsport.com": "https://www.motorsport.com/rss/f1/news/",
    "BBC F1": "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
}


def _strip_html(raw_html: str) -> str:
    """Strip HTML tags and unescape entities."""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    return html.unescape(clean).strip()


def _extract_image_from_item(item: ET.Element) -> Optional[str]:
    """Extract image url from enclosure, media:thumbnail, media:content, or description."""
    # 1. Enclosure
    enclosure = item.find("enclosure")
    if enclosure is not None and enclosure.get("url"):
        return enclosure.get("url")

    # 2. Namespaced elements (media:content, media:thumbnail)
    namespaces = {
        "media": "http://search.yahoo.com/mrss/",
        "dc": "http://purl.org/dc/elements/1.1/",
    }
    for tag in ("media:thumbnail", "media:content"):
        elem = item.find(tag, namespaces)
        if elem is not None and elem.get("url"):
            return elem.get("url")

    # 3. Check for <img> in description
    desc_elem = item.find("description")
    if desc_elem is not None and desc_elem.text:
        match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc_elem.text)
        if match:
            return match.group(1)

    return None


class RSSClient:
    """
    Async client fetching and standardizing F1 news from motorsport RSS feeds.
    Parses RSS 2.0 XML using standard library xml.etree.ElementTree.
    """

    def __init__(
        self,
        feeds: Optional[Dict[str, str]] = None,
        cache_client: Optional[DualModeCache] = None,
        timeout: float = 10.0,
    ) -> None:
        self.feeds = feeds or DEFAULT_FEEDS
        self.cache = cache_client or cache
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_http_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PitWall/1.0"},
                follow_redirects=True,
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "RSSClient":
        await self._get_http_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

    async def fetch_feed(self, source_name: str, url: str) -> List[Dict[str, Any]]:
        """Fetch and parse a single RSS feed."""
        cache_key = f"rss:feed:{source_name}"
        cached = await self.cache.get(cache_key)
        if cached is not None and isinstance(cached, list):
            return cached

        client = await self._get_http_client()
        try:
            response = await client.get(url)
            response.raise_for_status()
            articles = self.parse_feed_xml(response.text, source_name)
            await self.cache.set(cache_key, articles, ttl=600)
            return articles
        except Exception as exc:
            logger.warning(f"Error fetching RSS feed from {source_name} ({url}): {exc}")
            return []

    def parse_feed_xml(self, xml_content: str, source_name: str) -> List[Dict[str, Any]]:
        """Parse RSS 2.0 XML string into standardized article dicts."""
        articles: List[Dict[str, Any]] = []
        try:
            root = ET.fromstring(xml_content)
        except Exception as exc:
            logger.warning(f"Failed to parse XML for {source_name}: {exc}")
            return articles

        channel = root.find("channel")
        items = channel.findall("item") if channel is not None else root.findall(".//item")

        for item in items:
            title_elem = item.find("title")
            link_elem = item.find("link")
            desc_elem = item.find("description")
            pub_date_elem = item.find("pubDate")

            title = _strip_html(title_elem.text) if title_elem is not None and title_elem.text else "Untitled"
            link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""
            raw_desc = desc_elem.text if desc_elem is not None and desc_elem.text else ""
            clean_desc = _strip_html(raw_desc)
            pub_date = pub_date_elem.text.strip() if pub_date_elem is not None and pub_date_elem.text else ""
            image_url = _extract_image_from_item(item)

            articles.append(
                {
                    "title": title,
                    "description": clean_desc,
                    "link": link,
                    "pubDate": pub_date,
                    "pub_date": pub_date,
                    "source": source_name,
                    "image_url": image_url,
                    "thumbnail_url": image_url,
                }
            )

        return articles

    async def get_news(
        self,
        limit: int = 20,
        source: str = "all",
    ) -> List[Dict[str, Any]]:
        """
        Fetch news from all configured RSS feeds or a specific source.
        Returns standardized article list sorted by publication date descending.
        """
        all_articles: List[Dict[str, Any]] = []

        if source != "all" and source in self.feeds:
            all_articles = await self.fetch_feed(source, self.feeds[source])
        else:
            for src_name, feed_url in self.feeds.items():
                articles = await self.fetch_feed(src_name, feed_url)
                all_articles.extend(articles)

        # Sort by pubDate if parseable
        def sort_key(article: Dict[str, Any]) -> float:
            pub_str = article.get("pubDate") or ""
            try:
                dt = parsedate_to_datetime(pub_str)
                return dt.timestamp()
            except Exception:
                return 0.0

        all_articles.sort(key=sort_key, reverse=True)
        return all_articles[:limit]


# Singleton RSS client instance
rss_client = RSSClient()
