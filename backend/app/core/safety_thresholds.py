"""
app/core/safety_thresholds.py — Configurable safety thresholds for Thermosarva.

Thresholds are defined here and referenced by the safety engine.
NEVER hardcode these values inside route files or individual engines.
Modify this file to adjust product interpretation without touching business logic.

All temperature values are in degrees Celsius.
All AQI values use the US EPA standard.
All solar irradiance values are in W/m².
All durations are in hours.
"""

# ── Crew Heat Safety ──────────────────────────────────────────────────────────
# Output categories: NORMAL | CAUTION | HIGH_HEAT | CRITICAL

CREW_HEAT_INDEX_THRESHOLDS = {
    "NORMAL":    {"max": 27},     # ≤ 27°C heat index
    "CAUTION":   {"min": 27, "max": 32},
    "HIGH_HEAT": {"min": 32, "max": 39},
    "CRITICAL":  {"min": 39},      # ≥ 39°C heat index
}

CREW_AQI_THRESHOLDS = {
    "GOOD":        {"max": 50},
    "MODERATE":    {"min": 51, "max": 100},
    "UNHEALTHY_SENSITIVE": {"min": 101, "max": 150},
    "UNHEALTHY":   {"min": 151, "max": 200},
    "VERY_UNHEALTHY": {"min": 201, "max": 300},
    "HAZARDOUS":   {"min": 301},
}

# Solar irradiance thresholds (W/m²)
CREW_SOLAR_THRESHOLDS = {
    "LOW":      {"max": 200},
    "MODERATE": {"min": 200, "max": 600},
    "HIGH":     {"min": 600, "max": 900},
    "EXTREME":  {"min": 900},
}

# Operating duration escalation (hours)
CREW_DURATION_RISK_MULTIPLIER = {
    "LOW":    {"max_hours": 2,  "multiplier": 1.0},
    "MEDIUM": {"max_hours": 4,  "multiplier": 1.2},
    "HIGH":   {"max_hours": 6,  "multiplier": 1.5},
    "VERY_HIGH": {"max_hours": None, "multiplier": 2.0},
}

# Required break frequency recommendations (minutes per break)
CREW_BREAK_RECOMMENDATIONS = {
    "NORMAL":    120,   # break every 2 hours
    "CAUTION":   90,    # break every 90 min
    "HIGH_HEAT": 45,    # break every 45 min
    "CRITICAL":  20,    # break every 20 min
}


# ── Cold Storage Protection ───────────────────────────────────────────────────
# Output categories: NORMAL_EXTERNAL_LOAD | ELEVATED_COOLING_DEMAND | HIGH_THERMAL_PRESSURE
# NOTE: These are EXTERNAL environmental assessments only. No IoT. No internal temp claimed.

COLD_STORAGE_EXTERNAL_TEMP_THRESHOLDS = {
    "NORMAL_EXTERNAL_LOAD":      {"max": 28},
    "ELEVATED_COOLING_DEMAND":   {"min": 28, "max": 36},
    "HIGH_THERMAL_PRESSURE":     {"min": 36},
}

COLD_STORAGE_SOLAR_THRESHOLDS = {
    "LOW_SOLAR_LOAD":    {"max": 400},
    "MODERATE_SOLAR_LOAD": {"min": 400, "max": 700},
    "HIGH_SOLAR_LOAD":   {"min": 700},
}

# Equipment cooling capacity categories (user-provided profile)
COOLING_CAPACITY_CATEGORIES = {
    "STANDARD":   {"solar_tolerance_wm2": 400, "temp_tolerance_c": 30},
    "ENHANCED":   {"solar_tolerance_wm2": 600, "temp_tolerance_c": 35},
    "INDUSTRIAL": {"solar_tolerance_wm2": 900, "temp_tolerance_c": 40},
}

# Duration impact on external thermal load
COLD_STORAGE_DURATION_ESCALATION_HOURS = {
    "LOW":    2,
    "MEDIUM": 4,
    "HIGH":   6,
}


# ── Food Safety Guard ──────────────────────────────────────────────────────────
# Output categories: LOW_ENVIRONMENTAL_EXPOSURE | ELEVATED_ENVIRONMENTAL_EXPOSURE | HIGH_ENVIRONMENTAL_EXPOSURE
# NOTE: Environmental handling context only. Not food-temperature monitoring.

FOOD_SAFETY_AMBIENT_THRESHOLDS = {
    "LOW_ENVIRONMENTAL_EXPOSURE":      {"max": 25},
    "ELEVATED_ENVIRONMENTAL_EXPOSURE": {"min": 25, "max": 33},
    "HIGH_ENVIRONMENTAL_EXPOSURE":     {"min": 33},
}

FOOD_SAFETY_SOLAR_THRESHOLDS = {
    "LOW":      {"max": 300},
    "ELEVATED": {"min": 300, "max": 650},
    "HIGH":     {"min": 650},
}

# Duration thresholds (hours) at which exposure category escalates
FOOD_SAFETY_DURATION_ESCALATION = {
    "LOW_EXPOSURE_ESCALATION_HOURS":      3,
    "ELEVATED_EXPOSURE_ESCALATION_HOURS": 2,
}


# ── Risk Alert Thresholds ──────────────────────────────────────────────────────

CRITICAL_ALERT_RULES = [
    {
        "type": "HIGH_HEAT",
        "severity": "CRITICAL",
        "condition": "heat_index >= 39",
        "message": "Critical heat index detected. Immediate action required to protect crew.",
    },
    {
        "type": "HIGH_HEAT",
        "severity": "WARNING",
        "condition": "heat_index >= 32 and heat_index < 39",
        "message": "Elevated heat index. Monitor crew closely and increase hydration frequency.",
    },
    {
        "type": "EXTREME_TEMPERATURE",
        "severity": "CRITICAL",
        "condition": "temperature >= 41",
        "message": "Extreme ambient temperature. Consider suspending outdoor operations.",
    },
    {
        "type": "POOR_AIR_QUALITY",
        "severity": "WARNING",
        "condition": "aqi >= 151",
        "message": "Unhealthy air quality. Limit crew exposure and consider respiratory protection.",
    },
    {
        "type": "POOR_AIR_QUALITY",
        "severity": "CRITICAL",
        "condition": "aqi >= 201",
        "message": "Very unhealthy air quality. Outdoor operations not recommended.",
    },
    {
        "type": "HIGH_SOLAR",
        "severity": "WARNING",
        "condition": "ghi >= 700",
        "message": "High solar irradiance. Maximize shaded areas and use UV protection.",
    },
    {
        "type": "COLD_STORAGE_PRESSURE",
        "severity": "WARNING",
        "condition": "temperature >= 36",
        "message": "High external thermal pressure on refrigeration systems. Monitor cooling equipment.",
    },
]
