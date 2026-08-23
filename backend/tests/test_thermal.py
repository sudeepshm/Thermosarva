"""tests/test_thermal.py — Thermal engine unit tests."""
import pytest


@pytest.mark.anyio
async def test_thermal_outlook_stub(client, monkeypatch):
    """12-hour outlook returns 12 forecast slots in stub mode."""
    from app.schemas.common import ResolvedLocation
    from app.services.geocoding import validator

    async def mock_validate(lat, lon):
        return ResolvedLocation(
            latitude=lat, longitude=lon,
            address="Phoenix, AZ, USA", city="Phoenix", state="AZ", country="US"
        )
    monkeypatch.setattr(validator, "resolve_and_validate_coordinates", mock_validate)

    response = await client.post(
        "/api/v1/thermal/outlook",
        json={"latitude": 33.4484, "longitude": -112.0740, "date": "2026-08-22", "time": "08:00"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["forecast"]) == 12


@pytest.mark.anyio
async def test_solar_exposure_classified(client, monkeypatch):
    """Solar exposure must return a classified exposure level."""
    from app.schemas.common import ResolvedLocation
    from app.services.geocoding import validator

    async def mock_validate(lat, lon):
        return ResolvedLocation(
            latitude=lat, longitude=lon,
            address="Dallas, TX, USA", city="Dallas", state="TX", country="US"
        )
    monkeypatch.setattr(validator, "resolve_and_validate_coordinates", mock_validate)

    response = await client.post(
        "/api/v1/thermal/solar",
        json={"latitude": 32.7767, "longitude": -96.7970},
    )
    assert response.status_code == 200
    data = response.json()
    assert "exposure" in data["data"]["solar"]
    assert data["data"]["solar"]["exposure"] in ("LOW", "MODERATE", "HIGH", "EXTREME", "UNKNOWN")
