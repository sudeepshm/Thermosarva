"""
app/api/v1/operations.py — Operations API routes.

Routes:
  POST /api/v1/operations/window — Operating Window Planner
"""
from fastapi import APIRouter

from app.engines import operation_engine
from app.schemas.operation import OperatingWindowRequest
from app.services.geocoding.validator import resolve_and_validate_coordinates
from app.utils.time import today_date_str

router = APIRouter(prefix="/operations", tags=["Operations"])


@router.post("/window")
async def get_operating_window(body: OperatingWindowRequest):
    """
    Return recommended, marginal, and avoid operating periods
    for a U.S. food truck location based on thermal forecast.
    Does not guarantee business outcomes.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()

    result = await operation_engine.plan_operating_window(
        location=location,
        date=date,
        opening_time=body.opening_time,
        closing_time=body.closing_time,
        desired_duration_hours=body.desired_duration_hours,
    )
    return {"success": True, "data": result}
