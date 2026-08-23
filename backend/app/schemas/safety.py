"""app/schemas/safety.py — Safety endpoint schemas."""
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import EquipmentProfile


class CrewSafetyRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
    operating_duration_hours: float = Field(default=4.0, ge=0.5, le=16.0)


class ColdStorageRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
    operating_duration_hours: float = Field(default=4.0, ge=0.5, le=16.0)
    equipment_profile: EquipmentProfile = Field(default_factory=EquipmentProfile)


class FoodSafetyRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: Optional[str] = None
    time: Optional[str] = None
    operating_duration_hours: float = Field(default=4.0, ge=0.5, le=16.0)
    equipment_profile: EquipmentProfile = Field(default_factory=EquipmentProfile)
