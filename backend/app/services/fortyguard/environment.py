"""
app/services/fortyguard/environment.py — FortyGuard environmental parameters service.

Returns hyperlocal external environmental data:
  temperature, heat index, humidity, AQI, wind, UV, solar irradiance.

NEVER used for: footfall, food temperature, compressor health, internal IoT data.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


async def get_environmental_parameters(
    location: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """Request current environmental parameters for a U.S. location."""
    client = get_fortyguard_client()
    return await client.request(
        "environment/parameters",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "time": time,
        },
    )


async def get_forecast(
    location: ResolvedLocation,
    date: str,
    start_time: str,
    hours: int = 12,
) -> Dict[str, Any]:
    """Request a multi-hour environmental forecast for a U.S. location."""
    client = get_fortyguard_client()
    return await client.request(
        "environment/forecast",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "time": start_time,
            "hours": hours,
        },
    )
