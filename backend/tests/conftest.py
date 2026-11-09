import asyncio
import os
import sys
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.cache import InMemoryCache, DualModeCache
from app.database import Base
from app.rate_limiter import RateLimiter

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated in-memory SQLite session for tests."""
    engine = create_async_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
    )
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
def memory_cache() -> InMemoryCache:
    return InMemoryCache()


@pytest.fixture
def dual_cache(memory_cache) -> DualModeCache:
    dmc = DualModeCache(redis_url="redis://localhost:6379/15")
    dmc._redis_available = False
    dmc._in_memory = memory_cache
    return dmc


@pytest.fixture
def test_rate_limiter() -> RateLimiter:
    return RateLimiter(max_per_second=10.0, max_per_minute=100.0)
