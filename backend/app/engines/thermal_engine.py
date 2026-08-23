"""
app/engines/thermal_engine.py — Thermal intelligence engine.

Orchestrates:
  - 12-Hour Heat Outlook
  - Local Heat Map (GeoJSON)
  - Shade Finder
  - Solar Exposure Map
  - Urban Heat Insights

All data passes through cache before hitting FortyGuard.
"""
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.common import EnvironmentalParameters, ResolvedLocation
from app.services.cache import redis as cache
from app.services.fortyguard import environment as fg_env
from app.services.fortyguard import heatmap as fg_heatmap
from app.services.fortyguard import satellite as fg_satellite
from app.services.fortyguard import streetview as fg_streetview
from app.utils.geojson import feature_collection, thermal_feature
from app.utils.time import today_date_str

logger = get_logger(__name__)
settings = get_settings()


def _normalize_env_params(raw: Dict[str, Any]) -> EnvironmentalParameters:
    """Normalize raw FortyGuard/stub response to EnvironmentalParameters."""
    return EnvironmentalParameters(
        temperature_c=raw.get("temperature_c"),
        heat_index_c=raw.get("heat_index_c"),
        humidity_pct=raw.get("humidity_pct"),
        aqi=raw.get("aqi"),
        wind_speed_ms=raw.get("wind_speed_ms"),
        cloud_cover_pct=raw.get("cloud_cover_pct"),
        uv_index=raw.get("uv_index"),
        ghi_wm2=raw.get("ghi_wm2"),
        dni_wm2=raw.get("dni_wm2"),
        dhi_wm2=raw.get("dhi_wm2"),
        timestamp=raw.get("timestamp"),
        source="fortyguard_stub" if raw.get("__stub__") else "fortyguard",
    )


async def get_environmental_params(
    location: ResolvedLocation, date: str, time: str
) -> EnvironmentalParameters:
    """Fetch and cache environmental parameters."""
    key = cache.environment_key(location.latitude, location.longitude, date, time)
    raw = await cache.get_or_fetch(
        key,
        lambda: fg_env.get_environmental_parameters(location, date, time),
        ttl_seconds=settings.cache_ttl_environment,
    )
    return _normalize_env_params(raw)


async def get_12h_outlook(
    location: ResolvedLocation, date: str, start_time: str
) -> Dict[str, Any]:
    """
    12-Hour Heat Outlook.
    Returns a list of hourly thermal snapshots for the next 12 hours.
    """
    key = cache.forecast_key(location.latitude, location.longitude, date, start_time)
    raw = await cache.get_or_fetch(
        key,
        lambda: fg_env.get_forecast(location, date, start_time, hours=12),
        ttl_seconds=settings.cache_ttl_heatmap,
    )

    forecast_items = raw.get("forecast", [])
    normalized_forecast = [
        {
            "timestamp": item.get("timestamp", ""),
            "temperature_c": item.get("temperature_c"),
            "heat_index_c": item.get("heat_index_c"),
            "humidity_pct": item.get("humidity_pct"),
            "aqi": item.get("aqi"),
            "ghi_wm2": item.get("ghi_wm2"),
            "conditions": item.get("conditions", ""),
        }
        for item in forecast_items
    ]

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
        },
        "date": date,
        "start_time": start_time,
        "forecast": normalized_forecast,
        "data_source": "fortyguard_stub" if raw.get("__stub__") else "fortyguard",
    }


async def get_local_heatmap(
    location: ResolvedLocation, date: str, time: str
) -> Dict[str, Any]:
    """
    Local Heat Map — returns a GeoJSON FeatureCollection.
    Each Feature represents a thermal zone renderable by MapLibre.
    """
    key = cache.heatmap_key(location.latitude, location.longitude, date, time)
    raw = await cache.get_or_fetch(
        key,
        lambda: fg_heatmap.get_heatmap(location, date, time),
        ttl_seconds=settings.cache_ttl_heatmap,
    )

    thermal_zones = raw.get("thermal_zones", [])
    if not thermal_zones:
        # Fallback: create a single zone at the queried location
        thermal_zones = [{
            "lat": location.latitude,
            "lon": location.longitude,
            "temp_c": raw.get("temperature_c", 30.0),
            "radius_m": 500,
        }]

    features = [
        thermal_feature(
            lon=zone["lon"],
            lat=zone["lat"],
            radius_m=zone.get("radius_m", 500),
            temperature=zone.get("temp_c", 30.0),
            timestamp=time,
            extra_props={"heat_index_c": raw.get("heat_index_c")},
        )
        for zone in thermal_zones
    ]

    return {
        "location": {"latitude": location.latitude, "longitude": location.longitude},
        "date": date,
        "time": time,
        "thermal_layer": feature_collection(features),
        "data_source": "fortyguard_stub" if raw.get("__stub__") else "fortyguard",
    }


async def get_shade_finder(
    location: ResolvedLocation, date: str, time: str
) -> Dict[str, Any]:
    """
    Shade Finder — returns potential shade areas.
    NOTE: Results are POTENTIAL shade, not guaranteed real-time shade.
    """
    sat_key = cache.satellite_key(location.latitude, location.longitude, date)
    sv_key = cache.streetview_key(location.latitude, location.longitude, date, time)

    sat_data, sv_data = await _fetch_parallel(
        (sat_key, lambda: fg_satellite.get_satellite_segmentation(location, date), settings.cache_ttl_solar),
        (sv_key, lambda: fg_streetview.get_streetview_segmentation(location, date, time), settings.cache_ttl_solar),
    )

    shade_quality = sv_data.get("shade_quality", "UNKNOWN")
    vegetation_pct = sat_data.get("vegetation_cover_pct", 0)
    building_shade_pct = sv_data.get("building_shade_pct", 0)
    tree_canopy_pct = sv_data.get("tree_canopy_pct", 0)

    # Combine for potential shade score (0–100)
    shade_score = min(100, int(tree_canopy_pct * 0.6 + building_shade_pct * 0.4))

    return {
        "location": {"latitude": location.latitude, "longitude": location.longitude},
        "date": date,
        "time": time,
        "shade_assessment": {
            "shade_quality": shade_quality,
            "shade_score": shade_score,
            "tree_canopy_pct": tree_canopy_pct,
            "building_shade_pct": building_shade_pct,
            "vegetation_cover_pct": vegetation_pct,
            "note": "Potential shade areas based on satellite and street-view segmentation. Not guaranteed real-time shade.",
        },
        "green_areas": sat_data.get("green_areas", []),
        "data_source": "fortyguard_stub" if sat_data.get("__stub__") else "fortyguard",
    }


async def get_solar_exposure(
    location: ResolvedLocation, date: str, time: str
) -> Dict[str, Any]:
    """
    Solar Exposure Map — returns GHI, DNI, DHI, and exposure classification.
    """
    key = cache.solar_key(location.latitude, location.longitude, date, time)
    raw = await cache.get_or_fetch(
        key,
        lambda: fg_env.get_environmental_parameters(location, date, time),
        ttl_seconds=settings.cache_ttl_solar,
    )

    ghi = raw.get("ghi_wm2")
    exposure = _classify_solar_exposure(ghi)

    return {
        "location": {"latitude": location.latitude, "longitude": location.longitude},
        "date": date,
        "time": time,
        "solar": {
            "ghi_wm2": ghi,
            "dni_wm2": raw.get("dni_wm2"),
            "dhi_wm2": raw.get("dhi_wm2"),
            "uv_index": raw.get("uv_index"),
            "exposure": exposure,
        },
        "data_source": "fortyguard_stub" if raw.get("__stub__") else "fortyguard",
    }


async def get_urban_heat_insights(
    location: ResolvedLocation, date: str, time: str
) -> Dict[str, Any]:
    """
    Urban Heat Insights — combines satellite and environmental data
    to characterize urban heat island effects.
    """
    env_key = cache.environment_key(location.latitude, location.longitude, date, time)
    sat_key = cache.satellite_key(location.latitude, location.longitude, date)

    env_data, sat_data = await _fetch_parallel(
        (env_key, lambda: fg_env.get_environmental_parameters(location, date, time), settings.cache_ttl_environment),
        (sat_key, lambda: fg_satellite.get_satellite_segmentation(location, date), settings.cache_ttl_solar),
    )

    uhi_intensity = sat_data.get("urban_heat_island_intensity", "UNKNOWN")
    built_pct = sat_data.get("built_environment_pct", 0)
    vegetation_pct = sat_data.get("vegetation_cover_pct", 0)
    temp_c = env_data.get("temperature_c", 0)

    return {
        "location": {"latitude": location.latitude, "longitude": location.longitude},
        "date": date,
        "time": time,
        "urban_heat": {
            "uhi_intensity": uhi_intensity,
            "built_environment_pct": built_pct,
            "vegetation_cover_pct": vegetation_pct,
            "ambient_temperature_c": temp_c,
            "interpretation": _interpret_uhi(uhi_intensity, built_pct, vegetation_pct),
        },
        "data_source": "fortyguard_stub" if env_data.get("__stub__") else "fortyguard",
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _classify_solar_exposure(ghi: Optional[float]) -> str:
    if ghi is None:
        return "UNKNOWN"
    if ghi < 200:
        return "LOW"
    if ghi < 600:
        return "MODERATE"
    if ghi < 900:
        return "HIGH"
    return "EXTREME"


def _interpret_uhi(intensity: str, built_pct: float, vegetation_pct: float) -> str:
    if intensity == "HIGH" or built_pct > 70:
        return "Dense urban environment with significant heat island effect. Limited vegetation reduces cooling."
    if intensity == "MODERATE" or built_pct > 40:
        return "Moderate urban density. Some heat island effect present. Shade areas recommended for operations."
    return "Lower urban density. Reduced heat island effect. More favorable thermal environment."


async def _fetch_parallel(*tasks) -> List[Any]:
    """Fetch multiple cached resources concurrently."""
    import asyncio
    results = await asyncio.gather(
        *[cache.get_or_fetch(key, fn, ttl) for key, fn, ttl in tasks],
        return_exceptions=True,
    )
    processed = []
    for r in results:
        if isinstance(r, Exception):
            logger.warning("parallel_fetch_error", error=str(r))
            processed.append({})
        else:
            processed.append(r)
    return processed
