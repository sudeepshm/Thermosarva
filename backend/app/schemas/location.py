"""app/schemas/location.py — Location endpoint schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import Coordinates, EquipmentProfile


class LocationSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Address or place name (U.S. only)")


class CoordinateRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = Field(None, description="YYYY-MM-DD")
    time: Optional[str] = Field(None, description="HH:MM")


class LocationPlanRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
    radius_m: int = Field(default=800, ge=100, le=5000)


class LocationCompareRequest(BaseModel):
    locations: List[Coordinates] = Field(..., min_length=2, max_length=2)
    date: Optional[str] = None
    time: Optional[str] = None


class BusinessContextRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
    radius_m: int = Field(default=800, ge=100, le=5000)
