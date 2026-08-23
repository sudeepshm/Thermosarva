"""
app/api/v1/thermal.py — Thermal API routes.

Routes:
  POST /api/v1/thermal/outlook         — 12-Hour Heat Outlook
  POST /api/v1/thermal/heatmap         — Local Heat Map (GeoJSON)
  POST /api/v1/thermal/shade           — Shade Finder
  POST /api/v1/thermal/solar           — Solar Exposure Map
  POST /api/v1/thermal/urban-insights  — Urban Heat Insights
"""
from fastapi import APIRouter

from app.engines import thermal_engine
from app.schemas.thermal import HeatmapRequest, OutlookRequest, ThermalRequest
from app.services.geocoding.validator import resolve_and_validate_coordinates
from app.utils.time import today_date_str, utc_now

router = APIRouter(prefix="/thermal", tags=["Thermal"])


def _defaults(body):
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")
    return date, time


@router.post("/outlook")
async def get_12h_outlook(body: OutlookRequest):
    """Return a 12-hour thermal forecast for a U.S. location."""
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date, time = _defaults(body)
    start = body.start_time or time
    result = await thermal_engine.get_12h_outlook(location, date, start)
    return {"success": True, "data": result}


@router.post("/heatmap")
async def get_local_heatmap(body: HeatmapRequest):
    """Return a GeoJSON thermal heatmap for a U.S. location."""
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date, time = _defaults(body)
    result = await thermal_engine.get_local_heatmap(location, date, time)
    return {"success": True, "data": result}


@router.post("/shade")
async def get_shade_finder(body: ThermalRequest):
    """Return potential shade areas for a U.S. location."""
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date, time = _defaults(body)
    result = await thermal_engine.get_shade_finder(location, date, time)
    return {"success": True, "data": result}


@router.post("/solar")
async def get_solar_exposure(body: ThermalRequest):
    """Return solar exposure map (GHI, DNI, DHI, classification) for a U.S. location."""
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date, time = _defaults(body)
    result = await thermal_engine.get_solar_exposure(location, date, time)
    return {"success": True, "data": result}


@router.post("/urban-insights")
async def get_urban_heat_insights(body: ThermalRequest):
    """Return urban heat island insights for a U.S. location."""
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date, time = _defaults(body)
    result = await thermal_engine.get_urban_heat_insights(location, date, time)
    return {"success": True, "data": result}
