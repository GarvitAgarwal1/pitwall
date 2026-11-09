import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_SQLITE_URL = "sqlite+aiosqlite:///./pitwall.db"


class Base(DeclarativeBase):
    pass


def _create_initial_engine() -> tuple[AsyncEngine, async_sessionmaker[AsyncSession]]:
    url = settings.DATABASE_URL
    is_sqlite = url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}

    try:
        eng = create_async_engine(
            url,
            echo=settings.DEBUG,
            connect_args=connect_args,
            pool_pre_ping=True,
        )
        sm = async_sessionmaker(
            eng,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        return eng, sm
    except Exception as e:
        logger.warning(
            f"Failed to create engine with configured URL '{url}': {e}. Falling back to SQLite."
        )
        eng = create_async_engine(
            DEFAULT_SQLITE_URL,
            echo=settings.DEBUG,
            connect_args={"check_same_thread": False},
        )
        sm = async_sessionmaker(
            eng,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        return eng, sm


engine, async_session_maker = _create_initial_engine()


async def fallback_to_sqlite() -> None:
    """Explicitly switch engine and sessionmaker to local SQLite."""
    global engine, async_session_maker
    if str(engine.url).startswith("sqlite"):
        return
    logger.warning(
        f"Switching from {engine.url} to fallback SQLite: {DEFAULT_SQLITE_URL}"
    )
    await engine.dispose()
    engine = create_async_engine(
        DEFAULT_SQLITE_URL,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False},
    )
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


async def init_db() -> None:
    """Create all tables, falling back to SQLite if PostgreSQL connection fails."""
    global engine, async_session_maker
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database tables verified/created on {engine.url}")
    except Exception as exc:
        logger.warning(
            f"Database initialization failed on {engine.url} ({exc}). Falling back to SQLite..."
        )
        await fallback_to_sqlite()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Fallback database tables created on {engine.url}")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an async database session."""
    global engine, async_session_maker
    try:
        async with async_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
    except Exception as exc:
        # If connection failed and not yet on SQLite, fallback and retry once
        if not str(engine.url).startswith("sqlite"):
            logger.warning(f"Connection failed ({exc}). Retrying with SQLite fallback...")
            await fallback_to_sqlite()
            async with async_session_maker() as session:
                try:
                    yield session
                    await session.commit()
                except Exception:
                    await session.rollback()
                    raise
        else:
            raise
