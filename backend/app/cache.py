import asyncio
import json
import logging
import time
from typing import Any, Optional
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)


class InMemoryCache:
    """In-memory thread/async-safe TTL dictionary cache."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            val, expire_at = entry
            if time.time() > expire_at:
                del self._store[key]
                return None
            return val

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        async with self._lock:
            expire_at = time.time() + max(0, ttl)
            self._store[key] = (value, expire_at)
            return True

    async def delete(self, key: str) -> bool:
        async with self._lock:
            return bool(self._store.pop(key, None) is not None)

    async def clear(self) -> bool:
        async with self._lock:
            self._store.clear()
            return True


class DualModeCache:
    """
    Dual-mode cache that attempts Redis first, and automatically falls back
    to InMemoryCache if Redis is unreachable or connection fails.
    """

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self.redis_url = redis_url or settings.REDIS_URL
        self._redis_client: Optional[aioredis.Redis] = None
        self._in_memory = InMemoryCache()
        self._redis_available: Optional[bool] = None
        self._init_lock = asyncio.Lock()

    async def _get_redis(self) -> Optional[aioredis.Redis]:
        if self._redis_available is False:
            return None

        if self._redis_client is not None and self._redis_available is True:
            return self._redis_client

        async with self._init_lock:
            if self._redis_available is False:
                return None
            if self._redis_client is not None and self._redis_available is True:
                return self._redis_client

            try:
                client = aioredis.from_url(
                    self.redis_url,
                    socket_timeout=1.0,
                    socket_connect_timeout=1.0,
                    decode_responses=True,
                )
                await client.ping()
                self._redis_client = client
                self._redis_available = True
                logger.info(f"Connected to Redis cache at {self.redis_url}")
                return self._redis_client
            except Exception as exc:
                logger.warning(
                    f"Redis unavailable at {self.redis_url} ({exc}). Using InMemoryCache fallback."
                )
                self._redis_available = False
                self._redis_client = None
                return None

    async def get(self, key: str) -> Optional[Any]:
        client = await self._get_redis()
        if client is not None:
            try:
                raw = await client.get(key)
                if raw is None:
                    return None
                try:
                    return json.loads(raw)
                except Exception:
                    return raw
            except Exception as exc:
                logger.warning(
                    f"Redis GET failed for key '{key}' ({exc}). Falling back to InMemoryCache."
                )
                self._redis_available = False

        return await self._in_memory.get(key)

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        client = await self._get_redis()
        if client is not None:
            try:
                try:
                    serialized = json.dumps(value)
                except Exception:
                    serialized = str(value)
                await client.set(key, serialized, ex=ttl)
                return True
            except Exception as exc:
                logger.warning(
                    f"Redis SET failed for key '{key}' ({exc}). Falling back to InMemoryCache."
                )
                self._redis_available = False

        return await self._in_memory.set(key, value, ttl=ttl)

    async def delete(self, key: str) -> bool:
        client = await self._get_redis()
        if client is not None:
            try:
                await client.delete(key)
                # Also delete in-memory just in case
                await self._in_memory.delete(key)
                return True
            except Exception as exc:
                logger.warning(f"Redis DELETE failed for key '{key}' ({exc}).")
                self._redis_available = False

        return await self._in_memory.delete(key)

    async def clear(self) -> bool:
        client = await self._get_redis()
        if client is not None:
            try:
                await client.flushdb()
                await self._in_memory.clear()
                return True
            except Exception as exc:
                logger.warning(f"Redis FLUSHDB failed ({exc}).")
                self._redis_available = False

        return await self._in_memory.clear()


# Default singleton instance
cache = DualModeCache()


async def get(key: str) -> Optional[Any]:
    return await cache.get(key)


async def set(key: str, value: Any, ttl: int = 300) -> bool:
    return await cache.set(key, value, ttl=ttl)


async def delete(key: str) -> bool:
    return await cache.delete(key)


async def clear() -> bool:
    return await cache.clear()
