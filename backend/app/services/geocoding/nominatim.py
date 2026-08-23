"""
app/services/geocoding/nominatim.py — Async Nominatim geocoding client.

Uses OpenStreetMap's Nominatim service for:
  - Address → coordinates (forward geocoding)
  - Coordinates → address + country (reverse geocoding)

Nominatim usage policy: max 1 req/sec, must include a unique User-Agent.
"""
import asyncio
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings
from app.core.exceptions import GeocodingError, LocationNotFoundError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Nominatim rate limit
_RATE_LIMIT_DELAY = 1.1  # seconds between requests


class NominatimResult:
    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        self.lat: float = float(raw.get("lat", 0))
        self.lon: float = float(raw.get("lon", 0))
        self.display_name: str = raw.get("display_name", "")
        address = raw.get("address", {})
        self.city: str = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("county")
            or ""
        )
        self.state: str = address.get("state", "")
        self.country_code: str = address.get("country_code", "").lower()
        self.postcode: str = address.get("postcode", "")


class NominatimClient:
    def __init__(self):
        settings = get_settings()
        self.base_url = settings.nominatim_base_url
        self.user_agent = settings.nominatim_user_agent
        self._last_request_time: float = 0.0

    def _headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

    async def _rate_limit(self) -> None:
        """Enforce Nominatim's 1 request/second policy."""
        import time
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < _RATE_LIMIT_DELAY:
            await asyncio.sleep(_RATE_LIMIT_DELAY - elapsed)
        self._last_request_time = time.monotonic()

    async def search(self, query: str) -> NominatimResult:
        """Forward geocode: address/place name → coordinates."""
        await self._rate_limit()
        params = {
            "q": query,
            "format": "json",
            "addressdetails": 1,
            "limit": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/search",
                    params=params,
                    headers=self._headers(),
                )
                response.raise_for_status()
                results: List[Dict[str, Any]] = response.json()
        except httpx.HTTPError as exc:
            logger.error("nominatim_search_failed", query=query, error=str(exc))
            raise GeocodingError(f"Geocoding service error: {exc}") from exc

        if not results:
            raise LocationNotFoundError(f"No results found for: {query!r}")

        return NominatimResult(results[0])

    async def reverse(self, lat: float, lon: float) -> NominatimResult:
        """Reverse geocode: coordinates → address + country code."""
        await self._rate_limit()
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "addressdetails": 1,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/reverse",
                    params=params,
                    headers=self._headers(),
                )
                response.raise_for_status()
                result: Dict[str, Any] = response.json()
        except httpx.HTTPError as exc:
            logger.error("nominatim_reverse_failed", lat=lat, lon=lon, error=str(exc))
            raise GeocodingError(f"Reverse geocoding error: {exc}") from exc

        if "error" in result:
            raise LocationNotFoundError(f"Reverse geocoding failed: {result['error']}")

        return NominatimResult(result)
