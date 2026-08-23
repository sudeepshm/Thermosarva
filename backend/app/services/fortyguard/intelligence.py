"""
app/services/fortyguard/intelligence.py — FortyGuard heat intelligence service.

Returns composite heat intelligence: score, risk level, and operational recommendations.
Used by: Dashboard unified endpoint, Environmental Risk Center.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


async def get_heat_intelligence(
    location: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """
    Request composite heat intelligence for a U.S. location.
    Returns a heat intelligence score, risk level, and actionable context.
    """
    client = get_fortyguard_client()
    return await client.request(
        "intelligence/heat",
        {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "date": date,
            "time": time,
        },
    )
