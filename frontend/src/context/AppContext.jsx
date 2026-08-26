import { createContext, useContext, useState, useCallback } from 'react';
import { getDashboard, searchLocation as apiSearchLocation } from '../api/thermosarva';

export const DEFAULT_LOCATION = {};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchDashboard = useCallback(async (lat, lon, locationInfo = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard(lat, lon);
      if (!data?.location) {
        throw new Error('Dashboard data not found for this location.');
      }

      setDashboardData(data);
      setIsFallback(false);

      const locFromApi = data.location;
      setLocationState({
        lat: locFromApi?.latitude ?? lat,
        lon: locFromApi?.longitude ?? lon,
        address: locationInfo.address ?? locFromApi?.address ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        city: locationInfo.city ?? locFromApi?.city ?? '',
        state: locationInfo.state ?? locFromApi?.state ?? '',
        country: locFromApi?.country ?? 'United States',
      });
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
      setIsFallback(false);
      setDashboardData(null);
      setError(err.message || 'Dashboard data failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAndNavigate = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiSearchLocation(query);
      const loc = res?.data;
      if (!loc) throw new Error('No location found.');
      await fetchDashboard(loc.latitude, loc.longitude, {
        address: loc.address,
        city: loc.city,
        state: loc.state,
      });
    } catch (err) {
      setDashboardData(null);
      setError(err.message || 'Location search failed.');
      setLoading(false);
    }
  }, [fetchDashboard]);

  return (
    <AppContext.Provider value={{
      location,
      dashboardData,
      loading,
      error,
      isFallback,
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
