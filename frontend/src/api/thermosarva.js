/**
 * src/api/thermosarva.js — Typed API calls to the Thermosarva backend.
 *
 * All endpoints match the FastAPI routes in thermosarva-backend/app/api/v1/.
 */

import { api } from './client';

// ── Unified Dashboard ─────────────────────────────────────────────────────────

/**
 * Primary endpoint — fetches ALL environmental intelligence in one shot.
 * @param {number} lat
 * @param {number} lon
 * @param {object} opts
 * @param {string} [opts.date]              - YYYY-MM-DD, defaults to today
 * @param {string} [opts.time]              - HH:MM, defaults to now (UTC)
 * @param {string} [opts.openingTime]       - HH:MM
 * @param {string} [opts.closingTime]       - HH:MM
 * @param {number} [opts.operatingDuration] - hours
 * @returns {Promise<object>}
 */
export async function getDashboard(lat, lon, opts = {}) {
  return api.post('/v1/analysis/dashboard', {
    latitude: lat,
    longitude: lon,
    date: opts.date ?? null,
    time: opts.time ?? null,
    opening_time: opts.openingTime ?? '08:00',
    closing_time: opts.closingTime ?? '20:00',
    operating_duration_hours: opts.operatingDuration ?? 8,
  });
}

// ── Location ──────────────────────────────────────────────────────────────────

/**
 * Forward geocode a place name / address. Returns validated US coordinates.
 */
export async function searchLocation(query) {
  return api.post('/v1/location/search', { query });
}

/**
 * Analyze a US location for food-truck suitability.
 */
export async function planLocation(lat, lon, opts = {}) {
  return api.post('/v1/location/plan', {
    latitude: lat,
    longitude: lon,
    date: opts.date ?? null,
    time: opts.time ?? null,
    radius_m: opts.radiusM ?? 800,
  });
}

/**
 * Compare two US locations side-by-side.
 * @param {Array<{latitude:number, longitude:number}>} locations
 */
export async function compareLocations(locations, opts = {}) {
  return api.post('/v1/location/compare', {
    locations,
    date: opts.date ?? null,
    time: opts.time ?? null,
  });
}

/**
 * Get nearby POIs from OpenStreetMap.
 */
export async function getNearby(lat, lon, radius = 800, categories = null) {
  const params = new URLSearchParams({ lat, lon, radius });
  if (categories) params.append('categories', categories.join(','));
  return api.get(`/v1/location/nearby?${params}`);
}

/**
 * Get business potential / qualitative context for a location.
 */
export async function getBusinessContext(lat, lon, opts = {}) {
  return api.post('/v1/location/business-context', {
    latitude: lat,
    longitude: lon,
    date: opts.date ?? null,
    time: opts.time ?? null,
    radius_m: opts.radiusM ?? 800,
  });
}

// ── Thermal ───────────────────────────────────────────────────────────────────

export async function getThermalOutlook(lat, lon, opts = {}) {
  return api.post('/v1/thermal/outlook', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
    start_time: opts.startTime ?? null,
  });
}

export async function getHeatmap(lat, lon, opts = {}) {
  return api.post('/v1/thermal/heatmap', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}

export async function getShadeFinder(lat, lon, opts = {}) {
  return api.post('/v1/thermal/shade', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}

export async function getSolarExposure(lat, lon, opts = {}) {
  return api.post('/v1/thermal/solar', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}

export async function getUrbanInsights(lat, lon, opts = {}) {
  return api.post('/v1/thermal/urban-insights', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}

// ── Operations ────────────────────────────────────────────────────────────────

export async function getOperatingWindow(lat, lon, opts = {}) {
  return api.post('/v1/operations/window', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null,
    opening_time: opts.openingTime ?? '06:00',
    closing_time: opts.closingTime ?? '22:00',
    desired_duration_hours: opts.desiredDurationHours ?? 8,
  });
}

// ── Safety ────────────────────────────────────────────────────────────────────

export async function getCrewSafety(lat, lon, opts = {}) {
  return api.post('/v1/safety/crew', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
    operating_duration_hours: opts.operatingDurationHours ?? 8,
  });
}

export async function getColdStorage(lat, lon, opts = {}) {
  return api.post('/v1/safety/cold-storage', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
    equipment_profile: opts.equipmentProfile ?? {},
    operating_duration_hours: opts.operatingDurationHours ?? 8,
  });
}

export async function getFoodSafety(lat, lon, opts = {}) {
  return api.post('/v1/safety/food', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
    equipment_profile: opts.equipmentProfile ?? {},
    operating_duration_hours: opts.operatingDurationHours ?? 8,
  });
}

// ── Risk & Alerts ─────────────────────────────────────────────────────────────

export async function getEnvironmentalRisk(lat, lon, opts = {}) {
  return api.post('/v1/risk/environment', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}

export async function evaluateAlerts(lat, lon, opts = {}) {
  return api.post('/v1/alerts/evaluate', {
    latitude: lat, longitude: lon,
    date: opts.date ?? null, time: opts.time ?? null,
  });
}
