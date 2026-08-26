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
        "env_params",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "temperature": 32.5,
            "date_time": {
                "start_date": date,
                "start_time": time,
                "filter_type": 1,
            },
        },
    )


async def get_forecast(
    location: ResolvedLocation,
    date: str,
    start_time: str,
    hours: int = 12,
) -> Dict[str, Any]:
    """Request a multi-hour environmental forecast for a U.S. location."""
    end_hour = (int(start_time.split(":", 1)[0]) + max(1, min(hours, 23))) % 24
    client = get_fortyguard_client()
    return await client.request(
        "env_params",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "temperature": 32.5,
            "date_time": {
                "start_date": date,
                "start_time": start_time,
                "end_time": f"{end_hour:02d}:{start_time.split(':', 1)[1]}",
                "filter_type": 2,
            },
            "hours": hours,
        },
    )
