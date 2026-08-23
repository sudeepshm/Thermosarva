"""
app/schemas/common.py — Shared Pydantic schemas used across all features.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Location ──────────────────────────────────────────────────────────────────

class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class ResolvedLocation(BaseModel):
    """
    Normalized U.S. location object produced by the geocoding + validation pipeline.
    Every downstream engine receives this, never raw user input coordinates.
    """
    latitude: float
    longitude: float
    address: str
    city: str
    state: str
    country: str = "US"  # Always "US" — enforced before this object is created

    def to_coords(self) -> Coordinates:
        return Coordinates(latitude=self.latitude, longitude=self.longitude)


# ── GeoJSON ───────────────────────────────────────────────────────────────────

class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: Any


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any] = Field(default_factory=dict)


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature] = Field(default_factory=list)


# ── Map Response ──────────────────────────────────────────────────────────────

class MapConfig(BaseModel):
    center: List[float]          # [lon, lat] — GeoJSON convention
    bounds: List[List[float]]    # [[sw_lon, sw_lat], [ne_lon, ne_lat]]
    default_zoom: int = 12


# ── API Response Wrappers ─────────────────────────────────────────────────────

class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None
    unavailable_sources: List[str] = Field(default_factory=list)


class ErrorDetail(BaseModel):
    code: str
    message: str
    detail: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


# ── Environmental Parameters ──────────────────────────────────────────────────

class EnvironmentalParameters(BaseModel):
    """
    Core environmental readings returned by FortyGuard or stubs.
    These are EXTERNAL measurements only. No IoT/internal sensor data.
    """
    temperature_c: Optional[float] = None        # Ambient air temperature
    heat_index_c: Optional[float] = None         # Apparent temperature (heat + humidity)
    humidity_pct: Optional[float] = None
    aqi: Optional[int] = None                    # US EPA AQI
    wind_speed_ms: Optional[float] = None
    cloud_cover_pct: Optional[float] = None
    uv_index: Optional[float] = None
    ghi_wm2: Optional[float] = None              # Global Horizontal Irradiance
    dni_wm2: Optional[float] = None              # Direct Normal Irradiance
    dhi_wm2: Optional[float] = None              # Diffuse Horizontal Irradiance
    timestamp: Optional[str] = None
    source: str = "fortyguard"


# ── Equipment Profile (user-provided, no IoT) ─────────────────────────────────

class EquipmentProfile(BaseModel):
    """
    User-declared equipment profile for cold storage / food safety analysis.
    No real-time sensor data. User describes their setup.
    """
    cooling_capacity_category: str = Field(
        default="STANDARD",
        description="STANDARD | ENHANCED | INDUSTRIAL",
    )
    refrigeration_type: str = Field(
        default="COMPRESSOR",
        description="COMPRESSOR | EUTECTIC | DRY_ICE",
    )
    truck_shade_condition: str = Field(
        default="PARTIAL",
        description="FULL | PARTIAL | NONE",
    )
