"""app/schemas/alert.py — Alert and risk endpoint schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class RiskRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None


class AlertEvaluateRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
