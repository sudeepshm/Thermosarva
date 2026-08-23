"""tests/test_operations.py — Operation engine tests."""
import pytest

from app.engines.operation_engine import _classify_slot


def test_recommended_slot():
    suitability, reasons = _classify_slot(heat_index=24.0, aqi=40)
    assert suitability == "RECOMMENDED"


def test_marginal_slot_heat():
    suitability, reasons = _classify_slot(heat_index=34.0, aqi=40)
    assert suitability == "MARGINAL"


def test_avoid_slot_critical_heat():
    suitability, reasons = _classify_slot(heat_index=41.0, aqi=40)
    assert suitability == "AVOID"


def test_avoid_slot_very_unhealthy_aqi():
    suitability, reasons = _classify_slot(heat_index=24.0, aqi=210)
    assert suitability == "AVOID"


@pytest.mark.anyio
async def test_operating_window_endpoint(client, monkeypatch):
    """Operating window returns recommended/avoid periods."""
    from app.schemas.common import ResolvedLocation
    from app.services.geocoding import validator

    async def mock_validate(lat, lon):
        return ResolvedLocation(
            latitude=lat, longitude=lon,
            address="Houston, TX, USA", city="Houston", state="TX", country="US"
        )
    monkeypatch.setattr(validator, "resolve_and_validate_coordinates", mock_validate)

    response = await client.post(
        "/api/v1/operations/window",
        json={
            "latitude": 29.7604, "longitude": -95.3698,
            "date": "2026-08-22", "opening_time": "08:00",
            "closing_time": "20:00", "desired_duration_hours": 8.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "recommended_periods" in data["data"]
    assert "avoid_periods" in data["data"]
    assert "disclaimer" in data["data"]
    # Operations output must not claim business outcomes
    assert "guaranteed" not in str(data).lower()
    assert "revenue" not in str(data).lower()
