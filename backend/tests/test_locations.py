"""tests/test_locations.py — Location endpoint tests."""
import pytest


@pytest.mark.anyio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "United States" in data["supported_regions"]


@pytest.mark.anyio
async def test_location_search_us(client):
    """U.S. location search returns resolved location."""
    # This calls real Nominatim — skip in CI without network
    pytest.skip("Requires live Nominatim. Run manually.")
    response = await client.post("/api/v1/location/search", json={"query": "Austin, TX"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["country"] == "US"


@pytest.mark.anyio
async def test_location_search_non_us_rejected(client):
    """Non-U.S. location must be rejected with UNSUPPORTED_LOCATION."""
    pytest.skip("Requires live Nominatim. Run manually.")
    response = await client.post("/api/v1/location/search", json={"query": "London, UK"})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "UNSUPPORTED_LOCATION"


@pytest.mark.anyio
async def test_invalid_coordinates_rejected(client):
    """Coordinates outside valid ranges must return 422."""
    response = await client.post(
        "/api/v1/location/plan",
        json={"latitude": 999, "longitude": 0},
    )
    assert response.status_code == 422


@pytest.mark.anyio
async def test_us_coordinate_plan(client, monkeypatch):
    """Valid US coordinates should return a location plan."""
    # Mock validator to avoid live Nominatim in unit tests
    from app.schemas.common import ResolvedLocation
    from app.services.geocoding import validator

    async def mock_validate(lat, lon):
        return ResolvedLocation(
            latitude=lat, longitude=lon,
            address="Austin, TX, USA", city="Austin", state="TX", country="US"
        )

    monkeypatch.setattr(validator, "resolve_and_validate_coordinates", mock_validate)

    response = await client.post(
        "/api/v1/location/plan",
        json={"latitude": 30.2672, "longitude": -97.7431},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "thermal_conditions" in data["data"]
    assert "nearby_activity" in data["data"]
    # Must never contain footfall or revenue claims
    assert "footfall" not in str(data)
    assert "revenue" not in str(data)
