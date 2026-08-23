# Thermosarva Backend

Environmental intelligence API for food truck operators — powered by FortyGuard hyperlocal thermal data, OpenStreetMap geographic data, and NOAA weather alerts.

**U.S. locations only.**

---

## Quick Start

```bash
# 1. Clone and enter the backend directory
cd thermosarva-backend

# 2. Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate      # Windows
# source .venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — see configuration section below

# 5. Run the development server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Configuration (`.env`)

| Variable | Description | Default |
|---|---|---|
| `FORTYGUARD_API_KEY` | FortyGuard API key | _(empty)_ |
| `FORTYGUARD_STUB_MODE` | Use mock data when `true` | `true` |
| `DATABASE_URL` | SQLAlchemy async DB URL | SQLite |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `REDIS_FALLBACK_MEMORY` | In-memory cache when Redis down | `true` |
| `ALLOWED_ORIGINS` | Frontend CORS origins | `http://localhost:5173` |
| `OPENAQ_API_KEY` | Optional AQI fallback | _(empty)_ |

### FortyGuard Integration

When `FORTYGUARD_STUB_MODE=true` (default), the API returns clearly-labelled stub data so the application runs fully without a real FortyGuard key. Responses include `"data_source": "fortyguard_stub"`.

To connect a real FortyGuard key:
1. Set `FORTYGUARD_API_KEY=your_key`
2. Set `FORTYGUARD_STUB_MODE=false`
3. Set `FORTYGUARD_BASE_URL` to the correct endpoint

---

## API Endpoints

### Health
```
GET  /health
```

### Location
```
POST /api/v1/location/search           — Geocode & validate U.S. location
POST /api/v1/location/plan             — Location thermal + POI analysis
POST /api/v1/location/compare          — Side-by-side location comparison
GET  /api/v1/location/nearby           — GeoJSON POIs from OpenStreetMap
POST /api/v1/location/business-context — Qualitative business context
```

### Thermal
```
POST /api/v1/thermal/outlook           — 12-hour heat forecast
POST /api/v1/thermal/heatmap           — GeoJSON thermal heatmap
POST /api/v1/thermal/shade             — Potential shade areas
POST /api/v1/thermal/solar             — Solar exposure (GHI/DNI/DHI)
POST /api/v1/thermal/urban-insights    — Urban heat island analysis
```

### Operations
```
POST /api/v1/operations/window         — Operating window planner
```

### Safety
```
POST /api/v1/safety/crew               — Crew heat safety assessment
POST /api/v1/safety/cold-storage       — External cold storage thermal pressure
POST /api/v1/safety/food               — Environmental food handling context
```

### Risk & Alerts
```
POST /api/v1/risk/environment          — Multi-dimensional risk assessment
POST /api/v1/alerts/evaluate           — Rule-based critical condition alerts
```

### Unified Dashboard
```
POST /api/v1/analysis/dashboard        — Complete data package (frontend primary endpoint)
```

---

## Dashboard Request Example

```bash
curl -X POST http://localhost:8000/api/v1/analysis/dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 30.2672,
    "longitude": -97.7431,
    "date": "2026-08-22",
    "time": "10:00"
  }'
```

---

## Running Tests

```bash
# Activate venv first
pip install pytest pytest-asyncio anyio httpx

# Run all unit tests (no network required)
pytest tests/ -v -k "not live"

# Run safety engine unit tests
pytest tests/test_safety.py -v

# Run operation engine tests
pytest tests/test_operations.py -v
```

---

## Product Rules

| Rule | Enforcement |
|---|---|
| U.S. locations only | `validator.py` rejects non-US at geocoding layer |
| No fake footfall | Business context returns qualitative observations only |
| No IoT data | Safety engines use external environmental inputs only |
| FortyGuard = environmental truth | Only called for thermal/heat/solar/AQI/satellite |
| No synchronous HTTP | All external calls use `httpx.AsyncClient` |
| API keys never exposed | All secrets server-side via `.env` |

---

## Architecture

```
FORTYGUARD          → Environmental truth (thermal, AQI, solar, satellite)
OSM/NOMINATIM       → Geographic data (geocoding, US validation)
OVERPASS            → Nearby POIs (free, no key required)
NOAA NWS            → Official weather alerts (supplemental)
OPENAQ              → Optional AQI fallback
THERMOSARVA ENGINE  → Product interpretation & decision logic
THERMOSARVA DB      → User, project, saved-location, alert history
```

---

## Switching to PostgreSQL

Change `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/thermosarva
```

Run Alembic migrations (if configured) or let SQLAlchemy auto-create tables on startup.
