"""Pydantic v2 schemas for Circuits Directory and Historical Results."""

from typing import List, Optional
from pydantic import BaseModel, Field


class CircuitInfo(BaseModel):
    circuit_id: str
    circuit_name: str
    locality: str
    country: str
    lat: float
    long: float
    length_km: float
    turns: int
    lap_record_time: Optional[str] = None
    lap_record_driver: Optional[str] = None
    lap_record_year: Optional[int] = None


class CircuitsListResponse(BaseModel):
    circuits: List[CircuitInfo]


class CircuitWinnerItem(BaseModel):
    year: int
    driver_name: str
    constructor_name: str
    time: str
    laps: int


class CircuitPoleItem(BaseModel):
    year: int
    driver_name: str
    time: str


class CircuitHistoryResponse(BaseModel):
    circuit_id: str
    circuit_name: str
    first_held_year: int
    races_held_count: int
    past_winners: List[CircuitWinnerItem]
    past_pole_sitters: List[CircuitPoleItem]
