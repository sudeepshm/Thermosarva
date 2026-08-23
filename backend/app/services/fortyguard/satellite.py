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
) -> Dict[str, Any]:
    """
    Request satellite segmentation data for a U.S. location.
    Returns vegetation cover, built environment %, water body %, shade potential,
    and urban heat island intensity.
    """
    client = get_fortyguard_client()
    return await client.request(
        "satellite/segmentation",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "radius_m": 800,
        },
    )
