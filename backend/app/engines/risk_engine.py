"""
app/engines/risk_engine.py — Environmental risk aggregation and alert generation.

Orchestrates:
  - Environmental Risk Center (multi-dimensional risk assessment)
  - Critical Condition Alerts (rule-based — configurable from safety_thresholds.py)

Risk dimensions are always returned separately — never hidden behind a single score.
Alert rules are read from safety_thresholds.CRITICAL_ALERT_RULES.
"""
import asyncio
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.safety_thresholds import CRITICAL_ALERT_RULES
from app.schemas.common import EnvironmentalParameters, ResolvedLocation
from app.services.cache import redis as cache
from app.services.fortyguard import environment as fg_env
from app.services.weather.nws import get_nws_client
from app.utils.time import utc_now_iso

logger = get_logger(__name__)
settings = get_settings()


async def get_environmental_risk(
    location: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """
    Environmental Risk Center.

    Aggregates multiple environmental dimensions into separate risk categories.
    Never collapses everything into a single opaque risk number.
    """
    env_key = cache.environment_key(location.latitude, location.longitude, date, time)
    nws_key_str = cache.nws_key(location.latitude, location.longitude)

    env_raw, nws_alerts = await asyncio.gather(
        cache.get_or_fetch(
            env_key,
            lambda: fg_env.get_environmental_parameters(location, date, time),
            settings.cache_ttl_environment,
        ),
        cache.get_or_fetch(
            nws_key_str,
            lambda: _fetch_nws_alerts(location.latitude, location.longitude),
            settings.cache_ttl_nws_alerts,
        ),
        return_exceptions=True,
    )

    env_raw = env_raw if not isinstance(env_raw, Exception) else {}
    nws_alerts = nws_alerts if not isinstance(nws_alerts, Exception) else []

    temp_c = env_raw.get("temperature_c", 0) or 0
    heat_index_c = env_raw.get("heat_index_c", temp_c) or temp_c
    aqi = env_raw.get("aqi", 0) or 0
    ghi = env_raw.get("ghi_wm2", 0) or 0
    uv = env_raw.get("uv_index", 0) or 0

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
        },
        "date": date,
        "time": time,
        "risk": {
            "thermal": _assess_thermal_risk(temp_c, heat_index_c),
            "air_quality": _assess_aqi_risk(aqi),
            "solar": _assess_solar_risk(ghi, uv),
            "weather": _assess_weather_risk(nws_alerts),
        },
        "nws_alerts": nws_alerts if isinstance(nws_alerts, list) else [],
        "data_source": "fortyguard_stub" if env_raw.get("__stub__") else "fortyguard",
    }


async def evaluate_alerts(
    location: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """
    Critical Condition Alerts.

    Evaluates CRITICAL_ALERT_RULES from safety_thresholds.py
    against current environmental conditions and generates structured alerts.
    """
    env_key = cache.environment_key(location.latitude, location.longitude, date, time)
    env_raw = await cache.get_or_fetch(
        env_key,
        lambda: fg_env.get_environmental_parameters(location, date, time),
        settings.cache_ttl_environment,
    )

    temp_c = env_raw.get("temperature_c", 0) or 0
    heat_index_c = env_raw.get("heat_index_c", temp_c) or temp_c
    aqi = env_raw.get("aqi", 0) or 0
    ghi = env_raw.get("ghi_wm2", 0) or 0

    context = {
        "temperature": temp_c,
        "heat_index": heat_index_c,
        "aqi": aqi,
        "ghi": ghi,
    }

    triggered_alerts = _evaluate_rules(context, location)

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
        },
        "evaluated_at": utc_now_iso(),
        "environmental_values": context,
        "alerts": triggered_alerts,
        "alert_count": len(triggered_alerts),
        "has_critical": any(a["severity"] == "CRITICAL" for a in triggered_alerts),
        "data_source": "fortyguard_stub" if env_raw.get("__stub__") else "fortyguard",
    }


# ── Risk Dimension Assessors ──────────────────────────────────────────────────

def _assess_thermal_risk(temp_c: float, heat_index_c: float) -> Dict[str, Any]:
    if heat_index_c >= 39:
        level, description = "CRITICAL", "Critical heat index. Immediate action required."
    elif heat_index_c >= 32:
        level, description = "HIGH", "Elevated heat index. Enhanced crew monitoring required."
    elif heat_index_c >= 27:
        level, description = "MODERATE", "Moderate thermal conditions. Standard precautions apply."
    else:
        level, description = "LOW", "Comfortable thermal conditions."

    return {
        "level": level,
        "temperature_c": temp_c,
        "heat_index_c": heat_index_c,
        "description": description,
    }


def _assess_aqi_risk(aqi: int) -> Dict[str, Any]:
    if aqi >= 201:
        level, description = "CRITICAL", "Very unhealthy air quality. Outdoor operations not recommended."
    elif aqi >= 151:
        level, description = "HIGH", "Unhealthy air quality. Limit outdoor exposure."
    elif aqi >= 101:
        level, description = "MODERATE", "Unhealthy for sensitive groups. Monitor crew health."
    elif aqi >= 51:
        level, description = "LOW", "Moderate air quality. Generally acceptable."
    else:
        level, description = "GOOD", "Good air quality."

    return {"level": level, "aqi": aqi, "description": description}


def _assess_solar_risk(ghi: float, uv: float) -> Dict[str, Any]:
    if ghi >= 900 or uv >= 11:
        level, description = "EXTREME", "Extreme solar exposure. Maximum sun protection required."
    elif ghi >= 600 or uv >= 8:
        level, description = "HIGH", "High solar irradiance. Use shade and UV protection."
    elif ghi >= 200 or uv >= 3:
        level, description = "MODERATE", "Moderate solar conditions."
    else:
        level, description = "LOW", "Low solar exposure."

    return {"level": level, "ghi_wm2": ghi, "uv_index": uv, "description": description}


def _assess_weather_risk(alerts: List[Dict]) -> Dict[str, Any]:
    if not alerts:
        return {"level": "NONE", "active_alerts": 0, "description": "No active weather alerts."}

    severe = [a for a in alerts if a.get("severity", "").lower() in ("extreme", "severe")]
    if severe:
        return {
            "level": "CRITICAL",
            "active_alerts": len(alerts),
            "severe_alerts": len(severe),
            "description": f"{len(severe)} severe weather alert(s) active.",
            "alerts": [a.get("headline", "") for a in severe[:3]],
        }

    return {
        "level": "ELEVATED",
        "active_alerts": len(alerts),
        "description": f"{len(alerts)} weather alert(s) active.",
        "alerts": [a.get("headline", "") for a in alerts[:3]],
    }


# ── Rule Evaluator ────────────────────────────────────────────────────────────

def _evaluate_rules(context: Dict[str, float], location: ResolvedLocation) -> List[Dict[str, Any]]:
    """
    Evaluate CRITICAL_ALERT_RULES against the current environmental context.
    Rules use simple Python expression strings for easy configurability.
    """
    triggered = []
    for rule in CRITICAL_ALERT_RULES:
        try:
            condition_str = rule["condition"]
            # Safe eval with only numeric context values
            if eval(condition_str, {"__builtins__": {}}, context):  # noqa: S307
                triggered.append({
                    "type": rule["type"],
                    "severity": rule["severity"],
                    "message": rule["message"],
                    "location": {
                        "latitude": location.latitude,
                        "longitude": location.longitude,
                        "address": location.address,
                    },
                    "timestamp": utc_now_iso(),
                    "trigger_values": {k: round(v, 1) for k, v in context.items()},
                })
        except Exception as exc:
            logger.warning("alert_rule_eval_error", rule=rule.get("type"), error=str(exc))

    return triggered


async def _fetch_nws_alerts(lat: float, lon: float) -> List[Dict]:
    try:
        client = get_nws_client()
        return await client.get_alerts(lat, lon)
    except Exception as exc:
        logger.warning("nws_alerts_fetch_failed", error=str(exc))
        return []
