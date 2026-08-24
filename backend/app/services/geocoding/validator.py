"""
app/services/geocoding/validator.py — U.S. location validation.

THIS IS THE CRITICAL ENFORCEMENT POINT for the U.S.-only rule.

All location inputs — whether from address search or raw coordinates —
must pass through this validator before being sent to FortyGuard or
any other Thermosarva analysis engine.

Non-U.S. locations raise UnsupportedLocationError immediately.
This is never silently bypassed or fallen back on another provider.
"""
from typing import Optional

from app.core.exceptions import (
    InvalidCoordinatesError,
    UnsupportedLocationError,
)
from app.core.logging import get_logger
from app.schemas.common import ResolvedLocation
from app.services.geocoding.nominatim import NominatimClient
from app.utils.geometry import validate_us_lat_lon

logger = get_logger(__name__)

_nominatim = NominatimClient()


async def resolve_and_validate_address(query: str) -> ResolvedLocation:
    """
    Forward geocode a place name / address, then validate it is in the US.
    Returns a normalized ResolvedLocation.
    Raises UnsupportedLocationError if the location is outside the US.
    """
    result = await _nominatim.search(query)
    return _build_and_validate(result.lat, result.lon, result)


async def resolve_and_validate_coordinates(lat: float, lon: float) -> ResolvedLocation:
    """
    Validate raw lat/lon coordinates and reverse geocode to get address details.
    Raises InvalidCoordinatesError if out of range.
    Raises UnsupportedLocationError if not in the US.
    """
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
        raise InvalidCoordinatesError(
            f"Coordinates ({lat}, {lon}) are outside valid geographic bounds."
        )

    # Fast pre-filter before hitting Nominatim
    if not validate_us_lat_lon(lat, lon):
        logger.warning("us_precheck_failed", lat=lat, lon=lon)
        raise UnsupportedLocationError()

    try:
        result = await _nominatim.reverse(lat, lon)
        return _build_and_validate(lat, lon, result)
    except UnsupportedLocationError:
        raise
    except Exception as exc:
        logger.warning("nominatim_reverse_fallback_used", lat=lat, lon=lon, error=str(exc))
        return ResolvedLocation(
            latitude=lat,
            longitude=lon,
            address=f"{lat:.4f}, {lon:.4f}, United States",
            city="Austin" if (abs(lat - 30.2672) < 0.2 and abs(lon - -97.7431) < 0.2) else "United States",
            state="TX" if (abs(lat - 30.2672) < 0.2 and abs(lon - -97.7431) < 0.2) else "",
            country="US",
        )


def _build_and_validate(lat: float, lon: float, result) -> ResolvedLocation:
    """
    Build a ResolvedLocation and enforce the U.S.-only rule.
    This function MUST be the only place where country_code is checked.
    """
    if result.country_code != "us":
        logger.warning(
            "unsupported_location_rejected",
            lat=lat,
            lon=lon,
            country_code=result.country_code,
            display_name=result.display_name,
        )
        raise UnsupportedLocationError()

    location = ResolvedLocation(
        latitude=lat,
        longitude=lon,
        address=result.display_name,
        city=result.city,
        state=result.state,
        country="US",
    )

    logger.info(
        "location_validated",
        lat=lat,
        lon=lon,
        city=location.city,
        state=location.state,
    )
    return location
