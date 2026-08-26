"""Core FortyGuard API client."""
import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

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
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params, headers=self._headers())
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            raise FortyGuardError(str(exc)) from exc

    async def submit(self, endpoint: str, payload: Dict[str, Any]) -> str:
        response = await self._post(endpoint, payload)
        data = response.get("data") if isinstance(response.get("data"), dict) else response
        activity_id = data.get("activity_id") or data.get("id")
        if not activity_id:
            raise FortyGuardError(f"FortyGuard did not return an activity_id. Response: {response}")
        logger.info("fortyguard_submitted", endpoint=endpoint, activity_id=activity_id)
        return str(activity_id)

    async def poll(self, activity_id: str) -> Dict[str, Any]:
        for attempt in range(self.max_poll_attempts):
            try:
                status_response = await self._get(f"status/{activity_id}")
            except FortyGuardError as exc:
                logger.warning("fortyguard_poll_error", attempt=attempt, error=str(exc))
                await asyncio.sleep(self.poll_interval)
                continue

            data = status_response.get("data") if isinstance(status_response.get("data"), dict) else status_response
            status = str(data.get("status", "")).lower()
            logger.debug("fortyguard_poll", activity_id=activity_id, status=status, attempt=attempt)

            if status in ("completed", "succeeded"):
                return data.get("result", data)
            if status in ("failed", "error", "cancelled"):
                raise FortyGuardError(f"FortyGuard activity {activity_id} ended with status: {status}")

            await asyncio.sleep(min(self.poll_interval * (1.3 ** attempt), 15.0))

        raise FortyGuardTimeoutError(
            f"FortyGuard activity {activity_id} did not complete after {self.max_poll_attempts} attempts."
        )

    async def request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if self.settings.fortyguard_stub_mode:
            return self._stub_response(endpoint, payload)

        if not self.settings.fortyguard_api_key or self.settings.fortyguard_api_key == "your_fortyguard_api_key_here":
            raise FortyGuardError("FORTYGUARD_API_KEY is required when FORTYGUARD_STUB_MODE=false.")

        activity_id = await self.submit(endpoint, payload)
        result = await self.poll(activity_id)
        return self._normalize_official_result(endpoint, result, payload)

    def _normalize_official_result(self, endpoint: str, result: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
        if endpoint == "env_params":
            return self._normalize_env_params(result, payload)
        if endpoint == "heatmap":
            return self._normalize_heatmap(result)
        if endpoint == "satellite":
            return self._normalize_satellite(result)
        if endpoint == "streetview":
            return self._normalize_streetview(result)
        return result

    def _normalize_env_params(self, result: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
        locations = result.get("locations") or []
        first = locations[0] if locations else {}
        params = first.get("parameters") or {}
        solar = ((first.get("solar_irradiance") or {}).get("clear_sky") or {})
        timestamps = (result.get("metadata") or {}).get("timestamps") or []

        temp = first.get("temperature") or payload.get("temperature")
        normalized = {
            "temperature_c": temp,
            "heat_index_c": self._list_item(params.get("heat_index_celsius"), 0, temp),
            "humidity_pct": self._list_item(params.get("relative_humidity_percent"), 0),
            "aqi": self._list_item(params.get("aqi_us"), 0),
            "cloud_cover_pct": self._list_item(params.get("cloud_cover_metric"), 0),
            "ghi_wm2": solar.get("ghi"),
            "dni_wm2": solar.get("dni"),
            "dhi_wm2": solar.get("dhi"),
            "timestamp": timestamps[0] if timestamps else None,
            "official_result": result,
        }

        hours = int(payload.get("hours") or 0)
        if hours:
            normalized["forecast"] = [
                {
                    "timestamp": ts,
                    "temperature_c": temp,
                    "heat_index_c": self._list_item(params.get("heat_index_celsius"), i, temp),
                    "humidity_pct": self._list_item(params.get("relative_humidity_percent"), i),
                    "aqi": self._list_item(params.get("aqi_us"), i),
                    "ghi_wm2": solar.get("ghi"),
                    "conditions": "FortyGuard environmental parameters",
                }
                for i, ts in enumerate(timestamps[:hours])
            ]
        return normalized

    def _normalize_heatmap(self, result: Dict[str, Any]) -> Dict[str, Any]:
        map_data = result.get("map_data") or {}
        zones = []
        for feature in map_data.get("features", [])[:250]:
            ring = (((feature.get("geometry") or {}).get("coordinates") or [[]])[0] or [])
            if not ring:
                continue
            lon = sum(point[0] for point in ring) / len(ring)
            lat = sum(point[1] for point in ring) / len(ring)
            props = feature.get("properties") or {}
            zones.append({
                "lat": lat,
                "lon": lon,
                "temp_c": props.get("temperature") or props.get("temp_c") or props.get("value"),
                "radius_m": 120,
            })
        return {
            "thermal_zones": zones,
            "map_data": map_data,
            "stats_data": result.get("stats_data") or {},
            "official_result": result,
        }

    def _normalize_satellite(self, result: Dict[str, Any]) -> Dict[str, Any]:
        segments = ((result.get("segmentation") or {}).get("segments") or {})
        vegetation = self._segment_value(segments, ("vegetation", "tree", "grass", "green"))
        built = self._segment_value(segments, ("building", "road", "asphalt", "concrete", "built"))
        water = self._segment_value(segments, ("water",))
        return {
            "vegetation_cover_pct": vegetation,
            "built_environment_pct": built,
            "water_body_pct": water,
            "urban_heat_island_intensity": "HIGH" if built > 60 else "MODERATE" if built > 35 else "LOW",
            "green_areas": [],
            "official_result": result,
        }

    def _normalize_streetview(self, result: Dict[str, Any]) -> Dict[str, Any]:
        segments = ((result.get("front") or {}).get("segments") or {})
        tree = self._segment_value(segments, ("tree", "vegetation", "green"))
        building = self._segment_value(segments, ("building", "facade"))
        sky = self._segment_value(segments, ("sky",))
        building_shade = min(100, building * 0.35)
        return {
            "tree_canopy_pct": tree,
            "building_shade_pct": building_shade,
            "open_sky_pct": sky,
            "shade_quality": "HIGH" if tree + building_shade > 45 else "MODERATE" if tree + building_shade > 20 else "LOW",
            "official_result": result,
        }

    def _stub_response(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        lat = float(payload.get("latitude") or (payload.get("sat") or {}).get("latitude") or 30.2672)
        lon = float(payload.get("longitude") or (payload.get("sat") or {}).get("longitude") or -97.7431)
        if endpoint == "env_params":
            hours = int(payload.get("hours") or 0)
            base = {
                "__stub__": True,
                "temperature_c": 32.0,
                "heat_index_c": 36.0,
                "humidity_pct": 55,
                "aqi": 42,
                "cloud_cover_pct": 30,
                "uv_index": 7,
                "ghi_wm2": 720,
                "dni_wm2": 610,
                "dhi_wm2": 140,
                "timestamp": datetime.utcnow().isoformat(),
            }
            if hours:
                start = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
                base["forecast"] = [
                    {
                        "timestamp": (start + timedelta(hours=i)).isoformat(),
                        "temperature_c": 30 + i * 0.4,
                        "heat_index_c": 34 + i * 0.5,
                        "humidity_pct": 55,
                        "aqi": 42,
                        "ghi_wm2": max(0, 720 - abs(6 - i) * 80),
                        "conditions": "Stub conditions",
                    }
                    for i in range(hours)
                ]
            return base
        if endpoint == "heatmap":
            return {"__stub__": True, "temperature_c": 32.0, "heat_index_c": 36.0, "thermal_zones": [{"lat": lat, "lon": lon, "temp_c": 32.0, "radius_m": 500}]}
        if endpoint == "satellite":
            return {"__stub__": True, "vegetation_cover_pct": 26, "built_environment_pct": 54, "water_body_pct": 2, "urban_heat_island_intensity": "MODERATE", "green_areas": []}
        if endpoint == "streetview":
            return {"__stub__": True, "tree_canopy_pct": 22, "building_shade_pct": 18, "open_sky_pct": 60, "shade_quality": "MODERATE"}
        return {"__stub__": True}

    @staticmethod
    def _list_item(value: Any, index: int, default: Any = None) -> Any:
        if isinstance(value, list):
            return value[index] if index < len(value) else default
        return value if value is not None else default

    @staticmethod
    def _segment_value(segments: Dict[str, Any], names: tuple[str, ...]) -> float:
        total = 0.0
        for key, value in segments.items():
            if any(name in str(key).lower() for name in names):
                try:
                    total += float(value)
                except (TypeError, ValueError):
                    pass
        return total


_client: Optional[FortyGuardClient] = None


def get_fortyguard_client() -> FortyGuardClient:
    global _client
    if _client is None:
        _client = FortyGuardClient()
    return _client
