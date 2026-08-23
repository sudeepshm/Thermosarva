"""app/schemas/project.py — Project CRUD schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class DashboardRequest(BaseModel):
    """
    Unified dashboard request. Single endpoint for the frontend to get
    all environmental intelligence in one network round-trip.
    """
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = Field(None, description="YYYY-MM-DD")
    time: Optional[str] = Field(None, description="HH:MM")
    operating_duration_hours: float = Field(default=6.0, ge=1.0, le=16.0)
    opening_time: str = Field(default="09:00")
    closing_time: str = Field(default="21:00")
