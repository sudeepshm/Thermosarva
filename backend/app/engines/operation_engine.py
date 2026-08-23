"""
app/engines/operation_engine.py — Operating window planning engine.

Orchestrates:
  - Operating Window Planner

Combines FortyGuard 12-hour thermal forecast + NWS alerts
to recommend optimal operating periods for a food truck.
"""
import asyncio
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.safety_thresholds import CREW_HEAT_INDEX_THRESHOLDS
from app.schemas.common import ResolvedLocation
from app.services.cache import redis as cache
from app.services.fortyguard import environment as fg_env
from app.services.weather.nws import get_nws_client

logger = get_logger(__name__)
settings = get_settings()


async def plan_operating_window(
    location: ResolvedLocation,
    date: str,
    opening_time: str,
    closing_time: str,
    desired_duration_hours: float = 6.0,
) -> Dict[str, Any]:
    """
    Operating Window Planner.

    Analyzes the thermal forecast and NWS alerts for a U.S. location
    to identify recommended and avoid operating periods.

    Does NOT guarantee business outcomes. Provides environmental context only.
    """
    # Fetch forecast and NWS alerts concurrently
    forecast_key = cache.forecast_key(location.latitude, location.longitude, date, opening_time)
    nws_key = cache.nws_key(location.latitude, location.longitude)

    forecast_raw, nws_alerts = await asyncio.gather(
        cache.get_or_fetch(
            forecast_key,
            lambda: fg_env.get_forecast(location, date, opening_time, hours=12),
            settings.cache_ttl_heatmap,
        ),
        cache.get_or_fetch(
            nws_key,
            lambda: _fetch_nws_alerts(location.latitude, location.longitude),
            settings.cache_ttl_nws_alerts,
        ),
        return_exceptions=True,
    )

    forecast_raw = forecast_raw if not isinstance(forecast_raw, Exception) else {}
    nws_alerts = nws_alerts if not isinstance(nws_alerts, Exception) else []

    hourly_slots = forecast_raw.get("forecast", [])
    analyzed_slots = _analyze_slots(hourly_slots, opening_time, closing_time)

    recommended_windows = [s for s in analyzed_slots if s["suitability"] == "RECOMMENDED"]
    avoid_windows = [s for s in analyzed_slots if s["suitability"] == "AVOID"]
    marginal_windows = [s for s in analyzed_slots if s["suitability"] == "MARGINAL"]

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
        },
        "date": date,
        "requested_window": {
            "opening": opening_time,
            "closing": closing_time,
            "desired_duration_hours": desired_duration_hours,
        },
        "hourly_analysis": analyzed_slots,
        "recommended_periods": recommended_windows,
        "marginal_periods": marginal_windows,
        "avoid_periods": avoid_windows,
        "nws_alerts": nws_alerts if isinstance(nws_alerts, list) else [],
        "environmental_context": _build_env_context(hourly_slots),
        "disclaimer": (
            "Recommendations are based on environmental thermal forecast data only. "
            "They do not constitute business advice or guarantee operational outcomes."
        ),
        "data_source": "fortyguard_stub" if forecast_raw.get("__stub__") else "fortyguard",
    }


def _analyze_slots(
    slots: List[Dict],
    opening_time: str,
    closing_time: str,
) -> List[Dict[str, Any]]:
    """Classify each hourly slot as RECOMMENDED, MARGINAL, or AVOID."""
    analyzed = []
    for slot in slots:
        ts = slot.get("timestamp", "")
        # Filter to requested window (simple string prefix match HH:MM)
        slot_hour = ts[11:16] if len(ts) >= 16 else ""

        heat_index = slot.get("heat_index_c") or slot.get("temperature_c") or 0
        aqi = slot.get("aqi") or 0

        suitability, reasons = _classify_slot(heat_index, aqi)

        analyzed.append({
            "timestamp": ts,
            "time": slot_hour,
            "temperature_c": slot.get("temperature_c"),
            "heat_index_c": heat_index,
            "aqi": aqi,
            "ghi_wm2": slot.get("ghi_wm2"),
            "conditions": slot.get("conditions", ""),
            "suitability": suitability,
            "reasons": reasons,
        })

    return analyzed


def _classify_slot(heat_index: float, aqi: int) -> tuple:
    reasons = []

    # Heat index check
    if heat_index >= CREW_HEAT_INDEX_THRESHOLDS["CRITICAL"]["min"]:
        reasons.append("Critical heat index — crew safety risk.")
        return "AVOID", reasons
    if heat_index >= CREW_HEAT_INDEX_THRESHOLDS["HIGH_HEAT"]["min"]:
        reasons.append("High heat index — elevated crew heat exposure.")
        return "MARGINAL", reasons

    # AQI check
    if aqi >= 201:
        reasons.append("Very unhealthy air quality.")
        return "AVOID", reasons
    if aqi >= 151:
        reasons.append("Unhealthy air quality — consider crew protection.")
        return "MARGINAL", reasons

    if heat_index >= CREW_HEAT_INDEX_THRESHOLDS["CAUTION"]["min"]:
        reasons.append("Moderate heat — acceptable with breaks.")
        return "MARGINAL", reasons

    reasons.append("Favorable environmental conditions for operations.")
    return "RECOMMENDED", reasons


def _build_env_context(slots: List[Dict]) -> Dict[str, Any]:
    if not slots:
        return {}
    temps = [s.get("temperature_c") for s in slots if s.get("temperature_c") is not None]
    heat_indices = [s.get("heat_index_c") for s in slots if s.get("heat_index_c") is not None]
    return {
        "peak_temperature_c": max(temps) if temps else None,
        "min_temperature_c": min(temps) if temps else None,
        "peak_heat_index_c": max(heat_indices) if heat_indices else None,
    }


async def _fetch_nws_alerts(lat: float, lon: float) -> List[Dict]:
    try:
        client = get_nws_client()
        return await client.get_alerts(lat, lon)
    except Exception as exc:
        logger.warning("nws_alerts_fetch_failed", error=str(exc))
        return []
