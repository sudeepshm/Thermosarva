"""
app/services/fortyguard/heatmap.py — FortyGuard heatmap service.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


async def get_heatmap(
    location: ResolvedLocation,
    date: str,
    time: str,
    granularity: str = "100m",
) -> Dict[str, Any]:
    """
    Request a thermal heatmap for a validated U.S. location.
    Returns raw FortyGuard response (or stub) for normalization by the thermal engine.
    """
    client = get_fortyguard_client()
    return await client.request(
        "heatmap/generate",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "time": time,
            "granularity": granularity,
            "radius_m": 1000,
        },
    )
