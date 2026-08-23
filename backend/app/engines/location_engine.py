"""
app/engines/location_engine.py — Location intelligence engine.

Orchestrates:
  - Location Planner (candidate locations with thermal + POI context)
  - Location Comparison (two locations side-by-side)
  - Business Potential Insights (qualitative POI + environmental context)
  - Nearby Activity Explorer (GeoJSON POIs by category)

PRODUCT RULES:
  - Never claim exact footfall or customer counts
  - Never claim guaranteed revenue
  - All observations are qualitative and data-driven
"""
import asyncio
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.common import ResolvedLocation
from app.services.cache import redis as cache
from app.services.fortyguard import environment as fg_env
from app.services.fortyguard import satellite as fg_satellite
from app.services.places.overpass import POI, get_overpass_client
from app.utils.geojson import feature_collection, poi_feature

logger = get_logger(__name__)
settings = get_settings()


async def plan_location(
    location: ResolvedLocation,
    date: str,
    time: str,
    radius_m: int = 800,
) -> Dict[str, Any]:
    """
    Location Planner — analyze a U.S. location for food truck suitability.
    Returns thermal conditions, shade context, nearby activity, and environmental context.
    Does NOT return footfall predictions or revenue estimates.
    """
    # Fetch thermal + satellite + POIs concurrently
    env_key = cache.environment_key(location.latitude, location.longitude, date, time)
    sat_key = cache.satellite_key(location.latitude, location.longitude, date)
    poi_key = cache.pois_key(location.latitude, location.longitude, radius_m)

    env_raw, sat_raw, pois = await asyncio.gather(
        cache.get_or_fetch(
            env_key,
            lambda: fg_env.get_environmental_parameters(location, date, time),
            settings.cache_ttl_environment,
        ),
        cache.get_or_fetch(
            sat_key,
            lambda: fg_satellite.get_satellite_segmentation(location, date),
            settings.cache_ttl_solar,
        ),
        cache.get_or_fetch(
            poi_key,
            lambda: _fetch_pois(location.latitude, location.longitude, radius_m),
            settings.cache_ttl_pois,
        ),
        return_exceptions=True,
    )

    # Handle partial failures
    env_raw = env_raw if not isinstance(env_raw, Exception) else {}
    sat_raw = sat_raw if not isinstance(sat_raw, Exception) else {}
    pois = pois if not isinstance(pois, Exception) else []

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
            "city": location.city,
            "state": location.state,
        },
        "thermal_conditions": {
            "temperature_c": env_raw.get("temperature_c"),
            "heat_index_c": env_raw.get("heat_index_c"),
            "humidity_pct": env_raw.get("humidity_pct"),
            "aqi": env_raw.get("aqi"),
            "uv_index": env_raw.get("uv_index"),
        },
        "shade_context": {
            "vegetation_cover_pct": sat_raw.get("vegetation_cover_pct"),
            "shade_potential": sat_raw.get("shade_potential", "UNKNOWN"),
            "note": "Potential shade — not guaranteed real-time coverage.",
        },
        "nearby_activity": _summarize_pois(pois if isinstance(pois, list) else []),
        "environmental_context": {
            "urban_heat_island_intensity": sat_raw.get("urban_heat_island_intensity", "UNKNOWN"),
            "built_environment_pct": sat_raw.get("built_environment_pct"),
        },
        "data_source": "fortyguard_stub" if env_raw.get("__stub__") else "fortyguard",
    }


async def compare_locations(
    location_a: ResolvedLocation,
    location_b: ResolvedLocation,
    date: str,
    time: str,
) -> Dict[str, Any]:
    """
    Location Comparison — run both locations through the planner independently
    and return a side-by-side normalized response.
    """
    result_a, result_b = await asyncio.gather(
        plan_location(location_a, date, time),
        plan_location(location_b, date, time),
        return_exceptions=True,
    )

    return {
        "comparison": {
            "location_a": result_a if not isinstance(result_a, Exception) else {"error": str(result_a)},
            "location_b": result_b if not isinstance(result_b, Exception) else {"error": str(result_b)},
        },
        "date": date,
        "time": time,
    }


async def get_business_potential(
    location: ResolvedLocation,
    date: str,
    time: str,
    radius_m: int = 800,
) -> Dict[str, Any]:
    """
    Business Potential Insights.
    Returns qualitative observations from POI density, transit proximity,
    and environmental conditions.

    DOES NOT return: guaranteed revenue, exact customers, footfall predictions.
    """
    poi_key = cache.pois_key(location.latitude, location.longitude, radius_m)
    env_key = cache.environment_key(location.latitude, location.longitude, date, time)

    pois_raw, env_raw = await asyncio.gather(
        cache.get_or_fetch(
            poi_key,
            lambda: _fetch_pois(location.latitude, location.longitude, radius_m),
            settings.cache_ttl_pois,
        ),
        cache.get_or_fetch(
            env_key,
            lambda: fg_env.get_environmental_parameters(location, date, time),
            settings.cache_ttl_environment,
        ),
        return_exceptions=True,
    )

    pois: List[Dict] = pois_raw if isinstance(pois_raw, list) else []
    env_raw = env_raw if not isinstance(env_raw, Exception) else {}

    category_counts = _count_by_category(pois)
    transit_count = category_counts.get("transit", 0)
    food_count = category_counts.get("food", 0)
    total_pois = len(pois)

    observations = _generate_business_observations(
        total_pois, category_counts, transit_count,
        env_raw.get("temperature_c"), env_raw.get("heat_index_c"),
        env_raw.get("aqi"),
    )

    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
        },
        "context_summary": {
            "total_nearby_places": total_pois,
            "category_breakdown": category_counts,
            "search_radius_m": radius_m,
        },
        "observations": observations,
        "environmental_context": {
            "temperature_c": env_raw.get("temperature_c"),
            "heat_index_c": env_raw.get("heat_index_c"),
            "aqi": env_raw.get("aqi"),
        },
        "disclaimer": (
            "Observations are based on OpenStreetMap POI density and environmental data. "
            "They do not constitute footfall predictions, revenue estimates, or business guarantees."
        ),
    }


async def get_nearby_activity(
    lat: float,
    lon: float,
    radius_m: int = 800,
    categories: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Nearby Activity Explorer — returns GeoJSON FeatureCollection of nearby POIs.
    """
    poi_key = cache.pois_key(lat, lon, radius_m)
    pois: List[Dict] = await cache.get_or_fetch(
        poi_key,
        lambda: _fetch_pois(lat, lon, radius_m, categories),
        settings.cache_ttl_pois,
    )

    features = [
        poi_feature(
            name=p["name"],
            category=p["category"],
            lon=p["longitude"],
            lat=p["latitude"],
            distance_m=p.get("distance_m"),
            opening_hours=p.get("opening_hours"),
        )
        for p in (pois if isinstance(pois, list) else [])
    ]

    return {
        "location": {"latitude": lat, "longitude": lon},
        "radius_m": radius_m,
        "places_layer": feature_collection(features),
        "total_count": len(features),
    }


# ── Private Helpers ───────────────────────────────────────────────────────────

async def _fetch_pois(
    lat: float,
    lon: float,
    radius_m: int = 800,
    categories: Optional[List[str]] = None,
) -> List[Dict]:
    """Fetch POIs from Overpass and serialize to dicts for caching."""
    client = get_overpass_client()
    pois: List[POI] = await client.query_nearby(lat, lon, radius_m, categories)
    return [p.to_dict() for p in pois]


def _summarize_pois(pois: List[Dict]) -> Dict[str, Any]:
    counts = _count_by_category(pois)
    return {
        "total_nearby": len(pois),
        "by_category": counts,
        "closest_transit_m": next(
            (p["distance_m"] for p in pois if p.get("category") == "transit"), None
        ),
    }


def _count_by_category(pois: List[Dict]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for p in pois:
        cat = p.get("category", "other")
        counts[cat] = counts.get(cat, 0) + 1
    return counts


def _generate_business_observations(
    total: int,
    category_counts: Dict,
    transit_count: int,
    temp_c: Optional[float],
    heat_index_c: Optional[float],
    aqi: Optional[int],
) -> List[str]:
    """
    Generate qualitative business context observations.
    Never claims revenue, footfall, or customer count.
    """
    observations = []

    if total > 30:
        observations.append("High nearby commercial density — strong surrounding activity context.")
    elif total > 15:
        observations.append("Moderate nearby activity — reasonable surrounding context.")
    else:
        observations.append("Limited nearby commercial activity within the search radius.")

    if transit_count >= 3:
        observations.append("Strong transit proximity — multiple public transport access points nearby.")
    elif transit_count >= 1:
        observations.append("Transit access present — at least one public transport stop nearby.")
    else:
        observations.append("Limited transit access within the search radius.")

    food_count = category_counts.get("food", 0)
    if food_count > 5:
        observations.append("High existing food establishment density — competitive food environment.")
    elif food_count > 2:
        observations.append("Moderate food establishment presence nearby.")

    if temp_c is not None and temp_c >= 36:
        observations.append("High ambient temperature may reduce outdoor customer dwell time.")
    elif temp_c is not None and temp_c <= 25:
        observations.append("Comfortable ambient temperature — favorable outdoor conditions.")

    if heat_index_c is not None and heat_index_c >= 39:
        observations.append("Critical heat index — outdoor operations require crew heat safety measures.")

    if aqi is not None and aqi > 100:
        observations.append("Elevated AQI may affect outdoor customer comfort.")

    return observations
