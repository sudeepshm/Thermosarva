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

# In-memory geocoding cache
_GEOCODE_CACHE: Dict[str, Any] = {}

# Catalog of known US cities for instant fallback & resilience
KNOWN_US_CITIES = [
    {"name": "Austin", "state": "TX", "lat": 30.2672, "lon": -97.7431, "display_name": "Austin, Travis County, Texas, United States"},
    {"name": "Houston", "state": "TX", "lat": 29.7604, "lon": -95.3698, "display_name": "Houston, Harris County, Texas, United States"},
    {"name": "Dallas", "state": "TX", "lat": 32.7767, "lon": -96.7970, "display_name": "Dallas, Dallas County, Texas, United States"},
    {"name": "San Antonio", "state": "TX", "lat": 29.4241, "lon": -98.4936, "display_name": "San Antonio, Bexar County, Texas, United States"},
    {"name": "New York", "state": "NY", "lat": 40.7128, "lon": -74.0060, "display_name": "New York, NY, United States"},
    {"name": "Los Angeles", "state": "CA", "lat": 34.0522, "lon": -118.2437, "display_name": "Los Angeles, CA, United States"},
    {"name": "Chicago", "state": "IL", "lat": 41.8781, "lon": -87.6298, "display_name": "Chicago, Cook County, Illinois, United States"},
    {"name": "Phoenix", "state": "AZ", "lat": 33.4484, "lon": -112.0740, "display_name": "Phoenix, Maricopa County, Arizona, United States"},
    {"name": "Philadelphia", "state": "PA", "lat": 39.9526, "lon": -75.1652, "display_name": "Philadelphia, PA, United States"},
    {"name": "San Diego", "state": "CA", "lat": 32.7157, "lon": -117.1611, "display_name": "San Diego, CA, United States"},
    {"name": "San Jose", "state": "CA", "lat": 37.3382, "lon": -121.8863, "display_name": "San Jose, CA, United States"},
    {"name": "San Francisco", "state": "CA", "lat": 37.7749, "lon": -122.4194, "display_name": "San Francisco, CA, United States"},
    {"name": "Seattle", "state": "WA", "lat": 47.6062, "lon": -122.3321, "display_name": "Seattle, King County, Washington, United States"},
    {"name": "Denver", "state": "CO", "lat": 39.7392, "lon": -104.9903, "display_name": "Denver, CO, United States"},
    {"name": "Miami", "state": "FL", "lat": 25.7617, "lon": -80.1918, "display_name": "Miami, Miami-Dade County, Florida, United States"},
    {"name": "Atlanta", "state": "GA", "lat": 33.7490, "lon": -84.3880, "display_name": "Atlanta, Fulton County, Georgia, United States"},
    {"name": "Boston", "state": "MA", "lat": 42.3601, "lon": -71.0589, "display_name": "Boston, Suffolk County, Massachusetts, United States"},
    {"name": "Portland", "state": "OR", "lat": 45.5152, "lon": -122.6784, "display_name": "Portland, Multnomah County, Oregon, United States"},
    {"name": "Las Vegas", "state": "NV", "lat": 36.1699, "lon": -115.1398, "display_name": "Las Vegas, Clark County, Nevada, United States"},
    {"name": "Nashville", "state": "TN", "lat": 36.1627, "lon": -86.7816, "display_name": "Nashville, Davidson County, Tennessee, United States"},
    {"name": "New Orleans", "state": "LA", "lat": 29.9511, "lon": -90.0715, "display_name": "New Orleans, Orleans Parish, Louisiana, United States"},
    {"name": "Minneapolis", "state": "MN", "lat": 44.9778, "lon": -93.2650, "display_name": "Minneapolis, Hennepin County, Minnesota, United States"},
    {"name": "Charlotte", "state": "NC", "lat": 35.2271, "lon": -80.8431, "display_name": "Charlotte, Mecklenburg County, North Carolina, United States"},
    {"name": "Orlando", "state": "FL", "lat": 28.5383, "lon": -81.3792, "display_name": "Orlando, Orange County, Florida, United States"},
    {"name": "Washington", "state": "DC", "lat": 38.9072, "lon": -77.0369, "display_name": "Washington, District of Columbia, United States"},
]


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


def _find_nearest_known_city(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Find the closest known US city within ~50km."""
    import math
    best_dist = float("inf")
    best_city = None
    for c in KNOWN_US_CITIES:
        d = math.hypot(lat - c["lat"], lon - c["lon"])
        if d < best_dist:
            best_dist = d
            best_city = c
    if best_dist < 0.6:  # within approx 50km
        return best_city
    return None


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
        cache_key = f"search:{query.strip().lower()}"
        if cache_key in _GEOCODE_CACHE:
            return _GEOCODE_CACHE[cache_key]

        # Check predefined cities first for fast match
        q_clean = query.strip().lower()
        for c in KNOWN_US_CITIES:
            if c["name"].lower() == q_clean or f"{c['name'].lower()}, {c['state'].lower()}" == q_clean:
                res = NominatimResult({
                    "lat": str(c["lat"]),
                    "lon": str(c["lon"]),
                    "display_name": c["display_name"],
                    "address": {"city": c["name"], "state": c["state"], "country_code": "us"},
                })
                _GEOCODE_CACHE[cache_key] = res
                return res

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
        except Exception as exc:
            logger.warning("nominatim_search_failed", query=query, error=str(exc))
            # If query partially matches a known city, use fallback
            for c in KNOWN_US_CITIES:
                if c["name"].lower() in q_clean:
                    res = NominatimResult({
                        "lat": str(c["lat"]),
                        "lon": str(c["lon"]),
                        "display_name": c["display_name"],
                        "address": {"city": c["name"], "state": c["state"], "country_code": "us"},
                    })
                    _GEOCODE_CACHE[cache_key] = res
                    return res
            raise GeocodingError(f"Geocoding service error: {exc}") from exc

        if not results:
            raise LocationNotFoundError(f"No results found for: {query!r}")

        res = NominatimResult(results[0])
        _GEOCODE_CACHE[cache_key] = res
        return res

    async def reverse(self, lat: float, lon: float) -> NominatimResult:
        """Reverse geocode: coordinates → address + country code."""
        cache_key = f"reverse:{round(lat, 3)}:{round(lon, 3)}"
        if cache_key in _GEOCODE_CACHE:
            return _GEOCODE_CACHE[cache_key]

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
        except Exception as exc:
            logger.warning("nominatim_reverse_network_failed", lat=lat, lon=lon, error=str(exc))
            # Build resilient fallback
            nearest = _find_nearest_known_city(lat, lon)
            if nearest:
                res = NominatimResult({
                    "lat": str(lat),
                    "lon": str(lon),
                    "display_name": f"{nearest['name']}, {nearest['state']}, United States",
                    "address": {"city": nearest["name"], "state": nearest["state"], "country_code": "us"},
                })
            else:
                res = NominatimResult({
                    "lat": str(lat),
                    "lon": str(lon),
                    "display_name": f"{lat:.4f}, {lon:.4f}, United States",
                    "address": {"city": "United States", "state": "", "country_code": "us"},
                })
            _GEOCODE_CACHE[cache_key] = res
            return res

        if "error" in result:
            nearest = _find_nearest_known_city(lat, lon)
            if nearest:
                res = NominatimResult({
                    "lat": str(lat),
                    "lon": str(lon),
                    "display_name": f"{nearest['name']}, {nearest['state']}, United States",
                    "address": {"city": nearest["name"], "state": nearest["state"], "country_code": "us"},
                })
                _GEOCODE_CACHE[cache_key] = res
                return res
            raise LocationNotFoundError(f"Reverse geocoding failed: {result['error']}")

        res = NominatimResult(result)
        _GEOCODE_CACHE[cache_key] = res
        return res
