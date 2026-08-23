"""
app/api/v1/alerts.py — Risk and alerts API routes.

Routes:
  POST /api/v1/risk/environment    — Environmental Risk Center
  POST /api/v1/alerts/evaluate     — Critical Condition Alert Evaluation
"""
from fastapi import APIRouter

from app.engines import risk_engine
from app.schemas.alert import AlertEvaluateRequest, RiskRequest
from app.services.geocoding.validator import resolve_and_validate_coordinates
from app.utils.time import today_date_str, utc_now

router = APIRouter(tags=["Risk & Alerts"])


@router.post("/risk/environment")
async def get_environmental_risk(body: RiskRequest):
    """
    Return multi-dimensional environmental risk assessment.
    Risk dimensions: thermal, air_quality, solar, weather.
    Never collapsed into a single opaque score.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    result = await risk_engine.get_environmental_risk(location, date, time)
    return {"success": True, "data": result}


@router.post("/alerts/evaluate")
async def evaluate_alerts(body: AlertEvaluateRequest):
    """
    Evaluate critical condition alert rules against current environmental conditions.
    Rules are configured in safety_thresholds.CRITICAL_ALERT_RULES.
    """
    location = await resolve_and_validate_coordinates(body.latitude, body.longitude)
    date = body.date or today_date_str()
    time = body.time or utc_now().strftime("%H:%M")

    result = await risk_engine.evaluate_alerts(location, date, time)
    return {"success": True, "data": result}
