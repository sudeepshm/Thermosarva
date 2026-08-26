"""
app/services/fortyguard/heatmap.py — FortyGuard heatmap service.
"""
from typing import Any, Dict

from app.schemas.common import ResolvedLocation
from app.services.fortyguard.client import get_fortyguard_client


def _square_aoi(lat: float, lon: float, delta: float = 0.006) -> Dict[str, Any]:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lon - delta, lat - delta],
                        [lon + delta, lat - delta],
                        [lon + delta, lat + delta],
                        [lon - delta, lat + delta],
                        [lon - delta, lat - delta],
                    ]],
                },
            }
        ],
    }


async def get_heatmap(
    location: ResolvedLocation,
    date: str,
    time: str,
    granularity: str = "100m",
) -> Dict[str, Any]:
    """
    Request a thermal heatmap for a validated U.S. location.
    Returns normalized FortyGuard response for the thermal engine.
    """
    client = get_fortyguard_client()
    return await client.request(
        "heatmap",
        {
            "polygon_aoi": _square_aoi(location.latitude, location.longitude),
            "date_time": {
                "start_date": date,
                "start_time": time,
                "filter_type": 1,
            },
            "granularity": int(str(granularity).replace("m", "")),
        },
    )
