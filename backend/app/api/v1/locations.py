"""
app/api/v1/locations.py — Location API routes.

Routes:
  POST /api/v1/location/search         — Forward geocode + US validation
  POST /api/v1/location/plan           — Location Planner
  POST /api/v1/location/compare        — Location Comparison
  GET  /api/v1/location/nearby         — Nearby Activity Explorer
  POST /api/v1/location/business-context — Business Potential Insights
"""
from typing import List, Optional

from fastapi import APIRouter, Query

from app.engines import location_engine
from app.schemas.location import (
    BusinessContextRequest,
    LocationCompareRequest,
    LocationPlanRequest,
    LocationSearchRequest,
)
from app.services.geocoding.validator import (
    resolve_and_validate_address,
    resolve_and_validate_coordinates,
)
from app.utils.time import today_date_str, utc_now

router = APIRouter(prefix="/location", tags=["Location"])


@router.post("/search")
async def search_location(body: LocationSearchRequest):
    """
    Resolve a place name or address to validated U.S. coordinates.
    Non-U.S. locations are rejected with UNSUPPORTED_LOCATION.
    """
    location = await resolve_and_validate_address(body.query)
    return {"success": True, "data": location.model_dump()}


@router.post("/plan")
async def plan_location(body: LocationPlanRequest):
    """
    Analyze a U.S. location for food truck suitability.
    Returns thermal conditions, shade context, nearby activity, and environmental context.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    result = await location_engine.plan_location(location, date, time, body.radius_m)
    return {"success": True, "data": result}


@router.post("/compare")
async def compare_locations(body: LocationCompareRequest):
    """
    Compare two U.S. locations side-by-side on thermal and environmental conditions.
    Both locations are validated independently.
    """
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    loc_a = await resolve_and_validate_coordinates(
        body.locations[0].latitude, body.locations[0].longitude
    )
    loc_b = await resolve_and_validate_coordinates(
        body.locations[1].latitude, body.locations[1].longitude
    )

    result = await location_engine.compare_locations(loc_a, loc_b, date, time)
    return {"success": True, "data": result}


@router.get("/nearby")
async def get_nearby_activity(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius: int = Query(default=800, ge=100, le=5000),
    categories: Optional[str] = Query(default=None, description="Comma-separated categories"),
):
    """
    Return a GeoJSON FeatureCollection of nearby POIs from OpenStreetMap.
    """
    # Validate location is in US before fetching POIs
    await resolve_and_validate_coordinates(lat, lon)

    cats = [c.strip() for c in categories.split(",")] if categories else None
    result = await location_engine.get_nearby_activity(lat, lon, radius, cats)
    return {"success": True, "data": result}


@router.post("/business-context")
async def get_business_context(body: BusinessContextRequest):
    """
    Return qualitative business potential observations for a U.S. location.
    Based on POI density, transit proximity, and environmental conditions.
    Does NOT predict footfall, revenue, or customer counts.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    result = await location_engine.get_business_potential(location, date, time, body.radius_m)
    return {"success": True, "data": result}
