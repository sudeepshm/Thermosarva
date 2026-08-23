"""
app/api/v1/analysis.py — Unified Dashboard Endpoint.

POST /api/v1/analysis/dashboard

This is the primary endpoint the frontend calls on page load.
One request → complete environmental intelligence package.

Flow:
  Validate location → US check → cache check →
  Fetch env data + POIs (concurrent) →
  Run all engines concurrently →
  Return unified response

Partial failures are handled gracefully:
  - Failed sources are listed in unavailable_sources
  - Data that IS available is still returned
"""
import asyncio
from typing import Any, Dict, List

from fastapi import APIRouter

from app.core.logging import get_logger
from app.engines import location_engine, operation_engine, risk_engine, safety_engine, thermal_engine
from app.schemas.common import EquipmentProfile
from app.schemas.project import DashboardRequest
from app.services.geocoding.validator import resolve_and_validate_coordinates
from app.utils.geojson import map_bounds_from_center
from app.utils.time import today_date_str, utc_now

logger = get_logger(__name__)
router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/dashboard")
async def get_dashboard(body: DashboardRequest):
    """
    Unified dashboard endpoint.
    Returns a complete environmental intelligence package in one request.
    """
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    # Step 1: Validate location (US enforcement happens here)
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)

    unavailable_sources: List[str] = []
    default_equipment = EquipmentProfile()

    # Step 2: Run all engines concurrently
    (
        env_params,
        outlook_result,
        heatmap_result,
        shade_result,
        solar_result,
        urban_result,
        location_plan,
        nearby_result,
        business_result,
        operation_result,
        risk_result,
        alerts_result,
    ) = await asyncio.gather(
        _safe(thermal_engine.get_environmental_params(location, date, time), "fortyguard"),
        _safe(thermal_engine.get_12h_outlook(location, date, time), "fortyguard"),
        _safe(thermal_engine.get_local_heatmap(location, date, time), "fortyguard"),
        _safe(thermal_engine.get_shade_finder(location, date, time), "fortyguard"),
        _safe(thermal_engine.get_solar_exposure(location, date, time), "fortyguard"),
        _safe(thermal_engine.get_urban_heat_insights(location, date, time), "fortyguard"),
        _safe(location_engine.plan_location(location, date, time), "fortyguard"),
        _safe(location_engine.get_nearby_activity(location.latitude, location.longitude), "overpass"),
        _safe(location_engine.get_business_potential(location, date, time), None),
        _safe(operation_engine.plan_operating_window(location, date, body.opening_time, body.closing_time, body.operating_duration_hours), "fortyguard"),
        _safe(risk_engine.get_environmental_risk(location, date, time), "fortyguard"),
        _safe(risk_engine.evaluate_alerts(location, date, time), "fortyguard"),
        return_exceptions=False,
    )

    # Collect unavailable sources
    all_results = [
        env_params, outlook_result, heatmap_result, shade_result,
        solar_result, urban_result, location_plan, nearby_result,
        business_result, operation_result, risk_result, alerts_result,
    ]
    for r in all_results:
        if isinstance(r, dict) and r.get("__error__"):
            src = r.get("__source__")
            if src and src not in unavailable_sources:
                unavailable_sources.append(src)

    # Step 3: Build safety assessment from fetched env params
    crew_safety = {}
    cold_storage = {}
    food_safety = {}
    if env_params and not isinstance(env_params, dict) or (isinstance(env_params, dict) and not env_params.get("__error__")):
        from app.schemas.common import EnvironmentalParameters
        try:
            ep = env_params if isinstance(env_params, EnvironmentalParameters) else EnvironmentalParameters(**{
                k: env_params.get(k) for k in EnvironmentalParameters.model_fields
            })
            crew_safety = safety_engine.assess_crew_heat_safety(ep, body.operating_duration_hours)
            cold_storage = safety_engine.assess_cold_storage(ep, default_equipment, body.operating_duration_hours)
            food_safety = safety_engine.assess_food_safety(ep, default_equipment, body.operating_duration_hours)
        except Exception as exc:
            logger.warning("dashboard_safety_assessment_failed", error=str(exc))
            unavailable_sources.append("safety_engine")

    # Step 4: Build map config
    zoom = 13
    map_config = {
        "center": [location.longitude, location.latitude],
        "bounds": map_bounds_from_center(location.latitude, location.longitude, zoom),
        "default_zoom": zoom,
    }

    return {
        "success": True,
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
            "city": location.city,
            "state": location.state,
            "country": location.country,
        },
        "date": date,
        "time": time,
        "map": map_config,
        "thermal": {
            "current": _clean(env_params),
            "outlook": _clean(outlook_result),
            "heatmap": _clean(heatmap_result),
            "shade": _clean(shade_result),
            "solar": _clean(solar_result),
            "urban_heat": _clean(urban_result),
        },
        "location_context": {
            "plan": _clean(location_plan),
            "nearby": _clean(nearby_result),
            "business": _clean(business_result),
        },
        "operations": {
            "window": _clean(operation_result),
        },
        "safety": {
            "crew": crew_safety,
            "cold_storage": cold_storage,
            "food": food_safety,
        },
        "risk": {
            "environment": _clean(risk_result),
            "alerts": _clean(alerts_result),
        },
        "unavailable_sources": unavailable_sources,
    }


async def _safe(coro, source_label: str) -> Any:
    """Run a coroutine and return an error sentinel dict on failure."""
    try:
        return await coro
    except Exception as exc:
        logger.warning("dashboard_partial_failure", source=source_label, error=str(exc))
        return {"__error__": True, "__source__": source_label, "message": str(exc)}


def _clean(result: Any) -> Any:
    """Strip internal error sentinels from partial results."""
    if isinstance(result, dict) and result.get("__error__"):
        return None
    return result
