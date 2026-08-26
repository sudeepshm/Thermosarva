"""
app/services/fortyguard/satellite.py — FortyGuard satellite segmentation service.

Returns built-environment context for shade and urban heat analysis.
Used by: Shade Finder, Urban Heat Insights, Cold Storage Protection, Location Planner.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


async def get_satellite_segmentation(
    location: ResolvedLocation,
    date: str,
    time: str = "12:00",
) -> Dict[str, Any]:
    """
    Request satellite segmentation data for a U.S. location.
    Returns vegetation cover, built environment %, water body %, shade potential,
    and urban heat island intensity.
    """
    client = get_fortyguard_client()
    return await client.request(
        "satellite",
        {
            "sat": {
                "latitude": location.latitude,
                "longitude": location.longitude,
            },
            "date_time": {
                "start_date": date,
                "start_time": time,
                "filter_type": 1,
            },
            "granularity": 80,
        },
    )
