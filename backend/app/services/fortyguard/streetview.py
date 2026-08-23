"""
app/services/fortyguard/streetview.py — FortyGuard street-view segmentation service.

Returns street-level shade context: tree canopy %, building shade %, open sky %.
Used by: Shade Finder, Urban Heat Insights.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


async def get_streetview_segmentation(
    location: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """
    Request street-view segmentation for a U.S. location.
    Returns shade quality context based on street-level imagery analysis.
    """
    client = get_fortyguard_client()
    return await client.request(
        "streetview/segmentation",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "time": time,
        },
    )
