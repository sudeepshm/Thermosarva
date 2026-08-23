/**
 * src/context/AppContext.jsx — Global app state for Thermosarva.
 *
 * Holds:
 *   - location: the current US lat/lon + display info
 *   - dashboardData: full response from POST /api/v1/analysis/dashboard
 *   - loading / error state
 *
 * All 20 dashboard pages consume from this context.
 * A single location change triggers one backend call that refreshes everything.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { getDashboard, searchLocation as apiSearchLocation } from '../api/thermosarva';

// Default location: Austin, TX — famous US food truck city
export const DEFAULT_LOCATION = {
  lat: 30.2672,
  lon: -97.7431,
  address: 'Austin, TX, United States',
  city: 'Austin',
  state: 'TX',
  country: 'United States',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch fresh dashboard data for a given lat/lon.
   * Updates both location and dashboardData in context.
   */
  const fetchDashboard = useCallback(async (lat, lon, locationInfo = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard(lat, lon);
      setDashboardData(data);

      // Update location from API response if available
      const locFromApi = data?.location;
      setLocationState({
        lat: locFromApi?.latitude ?? lat,
        lon: locFromApi?.longitude ?? lon,
        address: locationInfo.address ?? locFromApi?.address ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        city: locationInfo.city ?? locFromApi?.city ?? '',
        state: locationInfo.state ?? locFromApi?.state ?? '',
        country: locFromApi?.country ?? 'United States',
      });
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for a US location by text query, then fetch dashboard.
   */
  const searchAndNavigate = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiSearchLocation(query);
      const loc = res?.data;
      if (!loc) throw new Error('No location found');
      await fetchDashboard(loc.latitude, loc.longitude, {
        address: loc.address,
        city: loc.city,
        state: loc.state,
      });
    } catch (err) {
      setError(err.message || 'Location search failed');
      setLoading(false);
    }
  }, [fetchDashboard]);

  return (
    <AppContext.Provider value={{
      location,
      dashboardData,
      loading,
      error,
      fetchDashboard,
      searchAndNavigate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
