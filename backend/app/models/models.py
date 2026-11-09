from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base


class Circuit(Base):
    __tablename__ = "circuits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    circuit_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    circuit_name: Mapped[str] = mapped_column(String(128), nullable=False)
    locality: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    length_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    turns: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    lap_record_time: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    lap_record_driver: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    lap_record_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    driver_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    permanent_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    code: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    first_name: Mapped[str] = mapped_column(String(64), nullable=False)
    last_name: Mapped[str] = mapped_column(String(64), nullable=False)
    date_of_birth: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    headshot_url: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    results: Mapped[list["Result"]] = relationship("Result", back_populates="driver", cascade="all, delete-orphan", lazy="selectin")


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    season: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    round: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    driver_id: Mapped[str] = mapped_column(String(64), ForeignKey("drivers.driver_id", ondelete="CASCADE"), index=True, nullable=False)
    constructor_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    grid: Mapped[int] = mapped_column(Integer, default=0)
    position: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position_text: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    points: Mapped[float] = mapped_column(Float, default=0.0)
    laps: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(64), default="Finished")
    time: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    fastest_lap_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    fastest_lap_time: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    driver: Mapped["Driver"] = relationship("Driver", back_populates="results", lazy="selectin")


class CacheEntry(Base):
    __tablename__ = "cache_entries"

    key: Mapped[str] = mapped_column(String(256), primary_key=True, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
