"""app/schemas/operation.py — Operation endpoint schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class OperatingWindowRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = Field(None, description="YYYY-MM-DD")
    opening_time: str = Field(default="09:00", description="HH:MM")
    closing_time: str = Field(default="21:00", description="HH:MM")
    desired_duration_hours: float = Field(default=6.0, ge=1.0, le=16.0)
