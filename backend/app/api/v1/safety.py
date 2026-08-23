"""
app/api/v1/safety.py — Safety API routes.

Routes:
  POST /api/v1/safety/crew          — Crew Heat Safety
  POST /api/v1/safety/cold-storage  — Cold Storage External Thermal Pressure
  POST /api/v1/safety/food          — Food Safety Environmental Exposure
"""
from fastapi import APIRouter

from app.engines import safety_engine
from app.engines.thermal_engine import get_environmental_params
from app.schemas.safety import ColdStorageRequest, CrewSafetyRequest, FoodSafetyRequest
from app.services.geocoding.validator import resolve_and_validate_coordinates
from app.utils.time import today_date_str, utc_now

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.post("/crew")
async def assess_crew_safety(body: CrewSafetyRequest):
    """
    Assess crew heat safety based on external environmental conditions.
    No IoT data. External conditions only.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    env = await get_environmental_params(location, date, time)
    result = safety_engine.assess_crew_heat_safety(env, body.operating_duration_hours)
    return {"success": True, "data": result}


@router.post("/cold-storage")
async def assess_cold_storage(body: ColdStorageRequest):
    """
    Assess external thermal pressure on cold storage equipment.
    Returns environmental load categories only. No internal sensor data.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    env = await get_environmental_params(location, date, time)
    result = safety_engine.assess_cold_storage(env, body.equipment_profile, body.operating_duration_hours)
    return {"success": True, "data": result}


@router.post("/food")
async def assess_food_safety(body: FoodSafetyRequest):
    """
    Assess environmental food handling conditions.
    Environmental exposure context only — not food temperature monitoring.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    env = await get_environmental_params(location, date, time)
    result = safety_engine.assess_food_safety(env, body.equipment_profile, body.operating_duration_hours)
    return {"success": True, "data": result}
