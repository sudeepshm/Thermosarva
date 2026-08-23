"""tests/test_safety.py — Safety engine unit tests (no network required)."""
import pytest

from app.core.safety_thresholds import CREW_HEAT_INDEX_THRESHOLDS
from app.engines.safety_engine import (
    assess_cold_storage,
    assess_crew_heat_safety,
    assess_food_safety,
)
from app.schemas.common import EnvironmentalParameters, EquipmentProfile


def make_env(**kwargs) -> EnvironmentalParameters:
    defaults = dict(
        temperature_c=25.0, heat_index_c=26.0, humidity_pct=50.0,
        aqi=45, wind_speed_ms=3.0, cloud_cover_pct=20.0,
        uv_index=5.0, ghi_wm2=400.0, dni_wm2=350.0, dhi_wm2=50.0,
    )
    defaults.update(kwargs)
    return EnvironmentalParameters(**defaults)


# ── Crew Heat Safety ──────────────────────────────────────────────────────────

def test_crew_normal_conditions():
    env = make_env(heat_index_c=24.0)
    result = assess_crew_heat_safety(env, operating_duration_hours=2.0)
    assert result["category"] == "NORMAL"


def test_crew_caution():
    env = make_env(heat_index_c=29.0)
    result = assess_crew_heat_safety(env, operating_duration_hours=2.0)
    assert result["category"] == "CAUTION"


def test_crew_high_heat():
    env = make_env(heat_index_c=35.0)
    result = assess_crew_heat_safety(env, operating_duration_hours=2.0)
    assert result["category"] == "HIGH_HEAT"


def test_crew_critical():
    env = make_env(heat_index_c=41.0)
    result = assess_crew_heat_safety(env, operating_duration_hours=4.0)
    assert result["category"] == "CRITICAL"


def test_crew_output_has_no_iot_data():
    """Safety output must never contain refrigerator or food temperature data."""
    env = make_env(heat_index_c=38.0)
    result = assess_crew_heat_safety(env, 4.0)
    result_str = str(result)
    assert "refrigerator" not in result_str.lower()
    assert "internal_temp" not in result_str.lower()
    assert "compressor" not in result_str.lower()


# ── Cold Storage ──────────────────────────────────────────────────────────────

def test_cold_storage_normal():
    env = make_env(temperature_c=22.0, ghi_wm2=200.0)
    profile = EquipmentProfile(truck_shade_condition="FULL")
    result = assess_cold_storage(env, profile, 3.0)
    assert result["external_thermal_pressure"] == "NORMAL_EXTERNAL_LOAD"


def test_cold_storage_high_pressure():
    env = make_env(temperature_c=40.0, ghi_wm2=850.0)
    profile = EquipmentProfile(truck_shade_condition="NONE")
    result = assess_cold_storage(env, profile, 6.0)
    assert result["external_thermal_pressure"] == "HIGH_THERMAL_PRESSURE"


def test_cold_storage_no_internal_temp_claimed():
    """Cold storage output must NEVER claim internal refrigerator temperature."""
    env = make_env(temperature_c=38.0, ghi_wm2=700.0)
    profile = EquipmentProfile()
    result = assess_cold_storage(env, profile, 5.0)
    result_str = str(result)
    assert "refrigerator_temperature" not in result_str
    assert "internal" not in result_str.lower()
    assert "failure" not in result_str.lower()
    assert "unsafe" not in result_str.lower()


# ── Food Safety ───────────────────────────────────────────────────────────────

def test_food_safety_low_exposure():
    env = make_env(temperature_c=22.0, ghi_wm2=150.0)
    profile = EquipmentProfile(truck_shade_condition="FULL")
    result = assess_food_safety(env, profile, 2.0)
    assert result["environmental_exposure_category"] == "LOW_ENVIRONMENTAL_EXPOSURE"


def test_food_safety_high_exposure():
    env = make_env(temperature_c=38.0, ghi_wm2=750.0)
    profile = EquipmentProfile(truck_shade_condition="NONE")
    result = assess_food_safety(env, profile, 5.0)
    assert result["environmental_exposure_category"] == "HIGH_ENVIRONMENTAL_EXPOSURE"


def test_food_safety_no_contamination_claimed():
    """Food safety output must never claim contamination, food temperature, or unsafe food."""
    env = make_env(temperature_c=36.0, ghi_wm2=700.0)
    profile = EquipmentProfile()
    result = assess_food_safety(env, profile, 4.0)
    result_str = str(result).lower()
    assert "contamination" not in result_str
    assert "food_temperature" not in result_str
    assert "food is unsafe" not in result_str
