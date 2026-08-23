"""app/schemas/thermal.py — Thermal endpoint schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class ThermalRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = Field(None, description="YYYY-MM-DD")
    time: Optional[str] = Field(None, description="HH:MM")


class HeatmapRequest(ThermalRequest):
    granularity: str = Field(default="100m")


class OutlookRequest(ThermalRequest):
    start_time: Optional[str] = Field(None, description="HH:MM start for 12h window")
