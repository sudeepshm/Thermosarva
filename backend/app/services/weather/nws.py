"""
app/services/weather/nws.py — NOAA National Weather Service client.

Used for official weather alerts as supplemental context.
Does NOT replace FortyGuard hyperlocal thermal data.
"""
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings
from app.core.exceptions import WeatherServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)


class NWSClient:
    def __init__(self):
        settings = get_settings()
        self.base_url = settings.nws_base_url.rstrip("/")
        self.headers = {
            "User-Agent": "thermosarva/1.0 (contact@thermosarva.com)",
            "Accept": "application/geo+json",
        }

    async def get_alerts(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        """
        Fetch active NWS weather alerts for a U.S. point (lat, lon).
        Returns a list of normalized alert dicts.
        """
        url = f"{self.base_url}/alerts/active"
        # NWS expects clean 4-decimal precision coordinates
        params = {"point": f"{lat:.4f},{lon:.4f}", "status": "actual", "limit": 20}
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(url, params=params, headers=self.headers)
                response.raise_for_status()
                data = response.json()
        except Exception as exc:
            logger.warning("nws_alerts_unavailable", error=str(exc))
            return []

        features = data.get("features", [])
        alerts = []
        for feat in features:
            props = feat.get("properties", {})
            alerts.append({
                "id": props.get("id", ""),
                "event": props.get("event", ""),
                "severity": props.get("severity", ""),
                "urgency": props.get("urgency", ""),
                "headline": props.get("headline", ""),
                "description": (props.get("description") or "")[:500],
                "onset": props.get("onset", ""),
                "expires": props.get("expires", ""),
                "source": "noaa_nws",
            })

        logger.info("nws_alerts_fetched", count=len(alerts), lat=lat, lon=lon)
        return alerts

    async def get_gridpoint_forecast(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Fetch NWS gridpoint forecast for broader weather context.
        Returns None on failure (non-critical — FortyGuard is the primary thermal source).
        """
        try:
            # Step 1: resolve point to grid
            async with httpx.AsyncClient(timeout=10.0) as client:
                point_resp = await client.get(
                    f"{self.base_url}/points/{lat},{lon}", headers=self.headers
                )
                point_resp.raise_for_status()
                point_data = point_resp.json()

            forecast_url = (
                point_data.get("properties", {}).get("forecast")
            )
            if not forecast_url:
                return None

            # Step 2: fetch forecast
            async with httpx.AsyncClient(timeout=10.0) as client:
                forecast_resp = await client.get(forecast_url, headers=self.headers)
                forecast_resp.raise_for_status()
                return forecast_resp.json()

        except Exception as exc:
            logger.warning("nws_forecast_unavailable", error=str(exc))
            return None


_nws_client: Optional[NWSClient] = None


def get_nws_client() -> NWSClient:
    global _nws_client
    if _nws_client is None:
        _nws_client = NWSClient()
    return _nws_client
