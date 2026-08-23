"""
app/engines/safety_engine.py — Environmental safety assessment engine.

Orchestrates:
  - Crew Heat Safety (NORMAL | CAUTION | HIGH_HEAT | CRITICAL)
  - Cold Storage Protection (external thermal pressure only — NO IoT)
  - Food Safety Guard (environmental exposure only — NO IoT)

CRITICAL PRODUCT RULES:
  - Never claim refrigerator internal temperature
  - Never claim compressor failure
  - Never claim food is unsafe from sensor data
  - Never hardcode thresholds — always read from safety_thresholds.py
"""
from typing import Any, Dict, List, Optional

from app.core.logging import get_logger
from app.core.safety_thresholds import (
    COLD_STORAGE_DURATION_ESCALATION_HOURS,
    COLD_STORAGE_EXTERNAL_TEMP_THRESHOLDS,
    COLD_STORAGE_SOLAR_THRESHOLDS,
    COOLING_CAPACITY_CATEGORIES,
    CREW_AQI_THRESHOLDS,
    CREW_BREAK_RECOMMENDATIONS,
    CREW_DURATION_RISK_MULTIPLIER,
    CREW_HEAT_INDEX_THRESHOLDS,
    CREW_SOLAR_THRESHOLDS,
    FOOD_SAFETY_AMBIENT_THRESHOLDS,
    FOOD_SAFETY_DURATION_ESCALATION,
    FOOD_SAFETY_SOLAR_THRESHOLDS,
)
from app.schemas.common import EnvironmentalParameters, EquipmentProfile

logger = get_logger(__name__)


# ── Crew Heat Safety ──────────────────────────────────────────────────────────

def assess_crew_heat_safety(
    env: EnvironmentalParameters,
    operating_duration_hours: float = 4.0,
) -> Dict[str, Any]:
    """
    Assess crew heat exposure risk from external environmental conditions.

    Inputs: external temperature, heat index, AQI, solar irradiance, duration.
    Output categories: NORMAL | CAUTION | HIGH_HEAT | CRITICAL
    """
    heat_index = env.heat_index_c or env.temperature_c or 0
    aqi = env.aqi or 0
    ghi = env.ghi_wm2 or 0

    # Primary: heat index category
    heat_category = _classify_heat_index(heat_index)

    # Duration escalation
    duration_factor = _duration_risk_factor(operating_duration_hours)
    if duration_factor >= 1.5 and heat_category == "CAUTION":
        heat_category = "HIGH_HEAT"
    elif duration_factor >= 2.0 and heat_category == "HIGH_HEAT":
        heat_category = "CRITICAL"

    # AQI modifier
    aqi_level = _classify_aqi(aqi)
    if aqi_level in ("UNHEALTHY", "VERY_UNHEALTHY", "HAZARDOUS") and heat_category == "NORMAL":
        heat_category = "CAUTION"

    # Solar modifier
    solar_level = _classify_solar(ghi)
    if solar_level == "EXTREME" and heat_category in ("NORMAL", "CAUTION"):
        heat_category = "HIGH_HEAT"

    break_freq = CREW_BREAK_RECOMMENDATIONS.get(heat_category, 60)

    recommendations = _crew_recommendations(heat_category, aqi_level, solar_level)

    return {
        "category": heat_category,
        "heat_index_c": heat_index,
        "temperature_c": env.temperature_c,
        "aqi": aqi,
        "aqi_level": aqi_level,
        "solar_level": solar_level,
        "ghi_wm2": ghi,
        "operating_duration_hours": operating_duration_hours,
        "recommended_break_frequency_minutes": break_freq,
        "recommendations": recommendations,
        "data_source": env.source,
        "disclaimer": "Assessment based on external environmental conditions only.",
    }


# ── Cold Storage Protection ───────────────────────────────────────────────────

def assess_cold_storage(
    env: EnvironmentalParameters,
    equipment_profile: EquipmentProfile,
    operating_duration_hours: float = 4.0,
) -> Dict[str, Any]:
    """
    Assess external thermal pressure on cold storage equipment.

    Inputs: external temperature, heat index, solar irradiance, duration, equipment profile.
    Output: NORMAL_EXTERNAL_LOAD | ELEVATED_COOLING_DEMAND | HIGH_THERMAL_PRESSURE

    NEVER outputs: refrigerator temperature, compressor status, food safety status.
    """
    temp_c = env.temperature_c or 0
    ghi = env.ghi_wm2 or 0

    # External temperature category
    temp_category = _classify_cold_storage_temp(temp_c)

    # Solar load category
    solar_category = _classify_cold_storage_solar(ghi)

    # Equipment tolerance check
    capacity = COOLING_CAPACITY_CATEGORIES.get(
        equipment_profile.cooling_capacity_category, COOLING_CAPACITY_CATEGORIES["STANDARD"]
    )

    # Shade adjustment
    shade_modifier = {
        "FULL": 0.7,
        "PARTIAL": 1.0,
        "NONE": 1.3,
    }.get(equipment_profile.truck_shade_condition, 1.0)

    effective_temp_load = temp_c * shade_modifier

    # Final pressure category
    if (
        effective_temp_load >= capacity["temp_tolerance_c"]
        or ghi >= capacity["solar_tolerance_wm2"]
        or temp_category == "HIGH_THERMAL_PRESSURE"
        or operating_duration_hours >= COLD_STORAGE_DURATION_ESCALATION_HOURS["HIGH"]
    ):
        pressure = "HIGH_THERMAL_PRESSURE"
    elif (
        effective_temp_load >= capacity["temp_tolerance_c"] * 0.85
        or solar_category == "MODERATE_SOLAR_LOAD"
        or operating_duration_hours >= COLD_STORAGE_DURATION_ESCALATION_HOURS["MEDIUM"]
    ):
        pressure = "ELEVATED_COOLING_DEMAND"
    else:
        pressure = "NORMAL_EXTERNAL_LOAD"

    return {
        "external_thermal_pressure": pressure,
        "external_temperature_c": temp_c,
        "effective_temperature_load_c": round(effective_temp_load, 1),
        "solar_load": solar_category,
        "ghi_wm2": ghi,
        "equipment_profile": equipment_profile.model_dump(),
        "operating_duration_hours": operating_duration_hours,
        "data_source": env.source,
        "disclaimer": (
            "This assessment reflects external environmental thermal pressure only. "
            "Thermosarva does not monitor onboard refrigeration equipment or food temperature."
        ),
    }


# ── Food Safety Guard ─────────────────────────────────────────────────────────

def assess_food_safety(
    env: EnvironmentalParameters,
    equipment_profile: EquipmentProfile,
    operating_duration_hours: float = 4.0,
) -> Dict[str, Any]:
    """
    Assess environmental food handling conditions.

    Inputs: external heat, solar exposure, operating duration, equipment profile.
    Output: LOW_ENVIRONMENTAL_EXPOSURE | ELEVATED_ENVIRONMENTAL_EXPOSURE | HIGH_ENVIRONMENTAL_EXPOSURE

    NEVER outputs: food temperature, contamination status, food safety certification.
    This is an environmental handling context, not food-temperature monitoring.
    """
    temp_c = env.temperature_c or 0
    ghi = env.ghi_wm2 or 0

    ambient_category = _classify_food_safety_ambient(temp_c)
    solar_category = _classify_food_safety_solar(ghi)

    # Duration escalation
    escalated_category = ambient_category
    escalation_hours = FOOD_SAFETY_DURATION_ESCALATION.get(
        f"{ambient_category}_ESCALATION_HOURS", 999
    )
    if operating_duration_hours >= escalation_hours:
        escalated_category = _escalate_food_safety(ambient_category)

    # Solar modifier
    if solar_category == "HIGH" and escalated_category == "LOW_ENVIRONMENTAL_EXPOSURE":
        escalated_category = "ELEVATED_ENVIRONMENTAL_EXPOSURE"

    # Shade modifier
    if equipment_profile.truck_shade_condition == "NONE" and escalated_category != "HIGH_ENVIRONMENTAL_EXPOSURE":
        escalated_category = _escalate_food_safety(escalated_category)

    return {
        "environmental_exposure_category": escalated_category,
        "ambient_temperature_c": temp_c,
        "solar_exposure": solar_category,
        "ghi_wm2": ghi,
        "operating_duration_hours": operating_duration_hours,
        "equipment_profile": equipment_profile.model_dump(),
        "recommendations": _food_safety_recommendations(escalated_category),
        "data_source": env.source,
        "disclaimer": (
            "This is an environmental food handling context assessment based on external conditions. "
            "It does not monitor or report food temperature or food safety compliance."
        ),
    }


# ── Classification Helpers ────────────────────────────────────────────────────

def _classify_heat_index(heat_index: float) -> str:
    for category, bounds in CREW_HEAT_INDEX_THRESHOLDS.items():
        lo = bounds.get("min", float("-inf"))
        hi = bounds.get("max", float("inf"))
        if lo <= heat_index < hi:
            return category
    return "CRITICAL"


def _classify_aqi(aqi: int) -> str:
    for level, bounds in CREW_AQI_THRESHOLDS.items():
        lo = bounds.get("min", 0)
        hi = bounds.get("max", float("inf"))
        if lo <= aqi <= hi:
            return level
    return "HAZARDOUS"


def _classify_solar(ghi: float) -> str:
    for level, bounds in CREW_SOLAR_THRESHOLDS.items():
        lo = bounds.get("min", 0)
        hi = bounds.get("max", float("inf"))
        if lo <= ghi < hi:
            return level
    return "EXTREME"


def _duration_risk_factor(hours: float) -> float:
    for band in sorted(CREW_DURATION_RISK_MULTIPLIER.values(), key=lambda x: x.get("max_hours") or 999):
        if band.get("max_hours") is None or hours <= band["max_hours"]:
            return band["multiplier"]
    return CREW_DURATION_RISK_MULTIPLIER["VERY_HIGH"]["multiplier"]


def _classify_cold_storage_temp(temp_c: float) -> str:
    for cat, bounds in COLD_STORAGE_EXTERNAL_TEMP_THRESHOLDS.items():
        lo = bounds.get("min", float("-inf"))
        hi = bounds.get("max", float("inf"))
        if lo <= temp_c < hi:
            return cat
    return "HIGH_THERMAL_PRESSURE"


def _classify_cold_storage_solar(ghi: float) -> str:
    for cat, bounds in COLD_STORAGE_SOLAR_THRESHOLDS.items():
        lo = bounds.get("min", 0)
        hi = bounds.get("max", float("inf"))
        if lo <= ghi < hi:
            return cat
    return "HIGH_SOLAR_LOAD"


def _classify_food_safety_ambient(temp_c: float) -> str:
    for cat, bounds in FOOD_SAFETY_AMBIENT_THRESHOLDS.items():
        lo = bounds.get("min", float("-inf"))
        hi = bounds.get("max", float("inf"))
        if lo <= temp_c < hi:
            return cat
    return "HIGH_ENVIRONMENTAL_EXPOSURE"


def _classify_food_safety_solar(ghi: float) -> str:
    for cat, bounds in FOOD_SAFETY_SOLAR_THRESHOLDS.items():
        lo = bounds.get("min", 0)
        hi = bounds.get("max", float("inf"))
        if lo <= ghi < hi:
            return cat
    return "HIGH"


def _escalate_food_safety(category: str) -> str:
    order = [
        "LOW_ENVIRONMENTAL_EXPOSURE",
        "ELEVATED_ENVIRONMENTAL_EXPOSURE",
        "HIGH_ENVIRONMENTAL_EXPOSURE",
    ]
    idx = order.index(category) if category in order else 0
    return order[min(idx + 1, len(order) - 1)]


def _crew_recommendations(heat_category: str, aqi_level: str, solar_level: str) -> List[str]:
    recs = []
    if heat_category == "CRITICAL":
        recs += [
            "Immediate shade required. Suspend non-essential outdoor activity.",
            "Ensure crew takes breaks every 20 minutes.",
            "Provide cold water and electrolytes continuously.",
        ]
    elif heat_category == "HIGH_HEAT":
        recs += [
            "Mandatory breaks every 45 minutes in shaded or air-conditioned areas.",
            "Increase hydration. Monitor crew for heat illness signs.",
        ]
    elif heat_category == "CAUTION":
        recs += ["Regular breaks recommended. Monitor crew hydration levels."]
    else:
        recs.append("Comfortable conditions. Standard crew protocols apply.")

    if aqi_level in ("UNHEALTHY", "VERY_UNHEALTHY", "HAZARDOUS"):
        recs.append("Poor air quality: consider N95 respiratory protection for crew.")
    if solar_level in ("HIGH", "EXTREME"):
        recs.append("High UV: ensure sunscreen, protective clothing, and hats for outdoor crew.")

    return recs


def _food_safety_recommendations(category: str) -> List[str]:
    if category == "HIGH_ENVIRONMENTAL_EXPOSURE":
        return [
            "High external heat load. Minimize time temperature-sensitive items spend in service area.",
            "Ensure equipment is operating within designed capacity.",
            "Consider shorter service windows during peak heat hours.",
        ]
    if category == "ELEVATED_ENVIRONMENTAL_EXPOSURE":
        return [
            "Moderately elevated external conditions. Monitor service area temperatures.",
            "Rotate temperature-sensitive inventory more frequently.",
        ]
    return ["Environmental conditions are within acceptable operating range."]
