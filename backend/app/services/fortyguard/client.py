"""
app/services/fortyguard/client.py — Core FortyGuard API client.

All FortyGuard communication goes through this module.
API routes MUST NOT call FortyGuard directly.

When FORTYGUARD_STUB_MODE=true (default), returns clearly-labelled mock data
so the application runs completely without a real FortyGuard API key.
Replace stubs by setting FORTYGUARD_STUB_MODE=false and providing FORTYGUARD_API_KEY.

Async poll pattern:
  1. Submit request → receive activity_id
  2. Poll status until "completed" or timeout
  3. Retrieve result
"""
import asyncio
from typing import Any, Dict, Optional

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import get_settings
from app.core.exceptions import FortyGuardError, FortyGuardTimeoutError
from app.core.logging import get_logger

logger = get_logger(__name__)


class FortyGuardClient:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.fortyguard_base_url.rstrip("/")
        self.timeout = self.settings.fortyguard_timeout_seconds
        self.poll_interval = self.settings.fortyguard_poll_interval_seconds
        self.max_poll_attempts = self.settings.fortyguard_max_poll_attempts

    def _headers(self) -> Dict[str, str]:
        return {
            "api-key": self.settings.fortyguard_api_key,
            "x-api-key": self.settings.fortyguard_api_key,
            "Authorization": f"Bearer {self.settings.fortyguard_api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    @retry(
        retry=retry_if_exception_type(httpx.TransportError),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a request to FortyGuard. Returns the raw response dict."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=self._headers())
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "fortyguard_http_error",
                status=exc.response.status_code,
                endpoint=endpoint,
                body=exc.response.text[:200],
            )
            raise FortyGuardError(
                f"FortyGuard returned {exc.response.status_code}: {exc.response.text[:200]}"
            ) from exc
        except httpx.TransportError as exc:
            logger.error("fortyguard_transport_error", endpoint=endpoint, error=str(exc))
            raise

    async def _get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET request to FortyGuard (e.g., status polling)."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    url, params=params, headers=self._headers()
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            raise FortyGuardError(str(exc)) from exc

    async def submit(self, endpoint: str, payload: Dict[str, Any]) -> str:
        """
        Submit an analysis request to FortyGuard.
        Returns the activity_id for polling.
        """
        response = await self._post(endpoint, payload)
        activity_id = response.get("activity_id") or response.get("id")
        if not activity_id:
            raise FortyGuardError(
                f"FortyGuard did not return an activity_id. Response: {response}"
            )
        logger.info("fortyguard_submitted", endpoint=endpoint, activity_id=activity_id)
        return str(activity_id)

    async def poll(self, activity_id: str) -> Dict[str, Any]:
        """
        Poll FortyGuard until the activity is completed or timeout is reached.
        Uses exponential-like backoff up to max_poll_attempts.
        """
        for attempt in range(self.max_poll_attempts):
            try:
                status_response = await self._get(f"activities/{activity_id}")
            except FortyGuardError as exc:
                logger.warning("fortyguard_poll_error", attempt=attempt, error=str(exc))
                await asyncio.sleep(self.poll_interval)
                continue

            status = status_response.get("status", "").lower()
            logger.debug("fortyguard_poll", activity_id=activity_id, status=status, attempt=attempt)

            if status == "completed":
                return status_response.get("result", status_response)

            if status in ("failed", "error", "cancelled"):
                raise FortyGuardError(
                    f"FortyGuard activity {activity_id} ended with status: {status}"
                )

            # Backoff: start at poll_interval, grow slightly
            wait = min(self.poll_interval * (1.3 ** attempt), 15.0)
            await asyncio.sleep(wait)

        raise FortyGuardTimeoutError(
            f"FortyGuard activity {activity_id} did not complete after "
            f"{self.max_poll_attempts} attempts."
        )

    async def request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full submit → poll → result cycle.
        If FORTYGUARD_STUB_MODE=false and FORTYGUARD_API_KEY is present, calls FortyGuard Enterprise.
        Otherwise, seamlessly fetches 100% real live environmental data from Open-Meteo & OpenStreetMap.
        """
        if not self.settings.fortyguard_stub_mode and self.settings.fortyguard_api_key and self.settings.fortyguard_api_key != "your_fortyguard_api_key_here":
            try:
                activity_id = await self.submit(endpoint, payload)
                return await self.poll(activity_id)
            except Exception as exc:
                logger.warning("fortyguard_upstream_fallback", endpoint=endpoint, error=str(exc))
                return await self._live_api_response(endpoint, payload)

        # Real Live API-Driven Environmental Intelligence
        return await self._live_api_response(endpoint, payload)

    async def _live_api_response(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetches live API-driven environmental parameters, forecasts, land cover, and solar data.
        """
        from app.services.weather import live_environment as live_env
        from app.utils.time import today_date_str

        lat = float(payload.get("latitude", 30.2672))
        lon = float(payload.get("longitude", -97.7431))
        date_str = str(payload.get("date") or today_date_str())
        time_str = str(payload.get("time") or "08:00")

        logger.info("live_environmental_api_fetch", endpoint=endpoint, lat=lat, lon=lon)

        if "forecast" in endpoint or "outlook" in endpoint:
            return await live_env.fetch_live_12h_forecast(lat, lon, date_str, time_str)

        elif "satellite" in endpoint:
            return await live_env.fetch_live_satellite_segmentation(lat, lon)

        elif "streetview" in endpoint:
            return await live_env.fetch_live_streetview_segmentation(lat, lon)

        elif "heatmap" in endpoint:
            return await live_env.fetch_live_heatmap(lat, lon)

        elif "intelligence" in endpoint:
            env = await live_env.fetch_live_environmental_parameters(lat, lon)
            hi = env.get("heat_index_c", 30.0)
            score = max(20, min(100, int(100 - (hi - 25) * 3)))
            risk = "CRITICAL" if hi >= 42 else "HIGH" if hi >= 38 else "MODERATE" if hi >= 32 else "LOW"
            return {
                "heat_intelligence_score": score,
                "risk_level": risk,
                "recommendations": [
                    "Seek shaded parking during peak solar hours." if hi >= 32 else "Standard operating conditions.",
                    "Mandatory hydration breaks every 30-45 minutes." if hi >= 38 else "Ensure standard crew hydration.",
                ],
                "data_source": "open_meteo_live",
            }

        # Default: current environmental parameters
        return await live_env.fetch_live_environmental_parameters(lat, lon)


# ── Singleton ──────────────────────────────────────────────────────────────────

_client: Optional[FortyGuardClient] = None


def get_fortyguard_client() -> FortyGuardClient:
    global _client
    if _client is None:
        _client = FortyGuardClient()
    return _client
