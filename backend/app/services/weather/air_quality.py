"""
app/services/weather/air_quality.py — OpenAQ air quality fallback service.

Primary AQI source is FortyGuard.
OpenAQ is used as an optional independent fallback when FortyGuard AQI is unavailable.
Requires OPENAQ_API_KEY (free registration at openaq.org).
"""
from typing import Any, Dict, Optional

import httpx

from app.core.config import get_settings
from app.core.exceptions import AirQualityServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)


class OpenAQClient:
    def __init__(self):
        settings = get_settings()
        self.base_url = settings.openaq_base_url.rstrip("/")
        self.api_key = settings.openaq_api_key

    def _headers(self) -> Dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def get_nearest_aqi(
        self, lat: float, lon: float, radius_m: int = 25000
    ) -> Optional[Dict[str, Any]]:
        """
        Get the nearest AQI reading from OpenAQ stations.
        Returns None if OpenAQ is not configured or unavailable.
        This is a fallback only — FortyGuard AQI takes priority.
        """
        if not self.is_configured:
            logger.debug("openaq_not_configured")
            return None

        params = {
            "coordinates": f"{lat},{lon}",
            "radius": radius_m,
            "limit": 5,
            "order_by": "distance",
            "parameters_id": 2,  # PM2.5
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/locations",
                    params=params,
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as exc:
            logger.warning("openaq_error", error=str(exc))
            return None

        results = data.get("results", [])
        if not results:
            return None

        nearest = results[0]
        return {
            "aqi_source": "openaq",
            "station_name": nearest.get("name", ""),
            "distance_m": nearest.get("distance", 0),
            "latest_measurements": nearest.get("latest", {}).get("values", []),
            "source": "openaq_fallback",
        }


_openaq_client: Optional[OpenAQClient] = None


def get_openaq_client() -> OpenAQClient:
    global _openaq_client
    if _openaq_client is None:
        _openaq_client = OpenAQClient()
    return _openaq_client
