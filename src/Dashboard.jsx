import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { AppProvider, useApp, DEFAULT_LOCATION } from './context/AppContext';

// Find a Location
import LocationPlanner from './pages/find-location/LocationPlanner';
import LocationComparison from './pages/find-location/LocationComparison';
import BusinessPotential from './pages/find-location/BusinessPotential';
import NearbyActivity from './pages/find-location/NearbyActivity';

// Heat Conditions
import HeatOutlook from './pages/heat-conditions/HeatOutlook';
import LocalHeatMap from './pages/heat-conditions/LocalHeatMap';
import ShadeFinder from './pages/heat-conditions/ShadeFinder';
import SolarExposure from './pages/heat-conditions/SolarExposure';
import AirQualityView from './pages/heat-conditions/AirQualityView';
import UrbanHeatInsights from './pages/heat-conditions/UrbanHeatInsights';

// Plan Operations
import OperatingWindowPlanner from './pages/plan-operations/OperatingWindowPlanner';
import MenuTimingPlanner from './pages/plan-operations/MenuTimingPlanner';

// Business Planning
import EventOpportunityPlanner from './pages/business-planning/EventOpportunityPlanner';
import LocationPerformanceInsights from './pages/business-planning/LocationPerformanceInsights';
import SitePlanning from './pages/business-planning/SitePlanning';

// Safety
import CrewHeatSafety from './pages/safety/CrewHeatSafety';
import ColdStorageProtection from './pages/safety/ColdStorageProtection';
import FoodSafetyGuard from './pages/safety/FoodSafetyGuard';

// Alerts & Risks
import EnvironmentalRiskCenter from './pages/alerts-risks/EnvironmentalRiskCenter';
import CriticalConditionAlerts from './pages/alerts-risks/CriticalConditionAlerts';

function DashboardInner() {
  const [collapsed, setCollapsed] = useState(false);
  const { dashboardData, fetchDashboard } = useApp();

  // Restore fixed layout (landing page sets body to overflow:auto)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height   = '100vh';
    document.body.style.width    = '100vw';
    return () => {
      document.body.style.overflow = '';
      document.body.style.height   = '';
      document.body.style.width    = '';
    };
  }, []);

  // Fetch data for Austin TX on first load
  useEffect(() => {
    fetchDashboard(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
  }, [fetchDashboard]);

  // Derive alert count from real API data
  const alerts = dashboardData?.risk?.alerts;
  const alertCount = Array.isArray(alerts?.triggered_alerts)
    ? alerts.triggered_alerts.length
    : Array.isArray(alerts)
    ? alerts.filter(a => a.triggered).length
    : 0;

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-content">
        <TopBar alertCount={alertCount} />
        <Routes>
          {/* Default redirect */}
          <Route index element={<Navigate to="location-planner" replace />} />

          {/* Find a Location */}
          <Route path="location-planner"   element={<LocationPlanner />} />
          <Route path="location-comparison" element={<LocationComparison />} />
          <Route path="business-potential"  element={<BusinessPotential />} />
          <Route path="nearby-activity"     element={<NearbyActivity />} />

          {/* Heat Conditions */}
          <Route path="heat-outlook"    element={<HeatOutlook />} />
          <Route path="local-heat-map"  element={<LocalHeatMap />} />
          <Route path="shade-finder"    element={<ShadeFinder />} />
          <Route path="solar-exposure"  element={<SolarExposure />} />
          <Route path="air-quality"     element={<AirQualityView />} />
          <Route path="urban-heat"      element={<UrbanHeatInsights />} />

          {/* Plan Operations */}
          <Route path="operating-window" element={<OperatingWindowPlanner />} />
          <Route path="menu-timing"      element={<MenuTimingPlanner />} />

          {/* Business Planning */}
          <Route path="event-opportunity"    element={<EventOpportunityPlanner />} />
          <Route path="location-performance" element={<LocationPerformanceInsights />} />
          <Route path="site-planning"        element={<SitePlanning />} />

          {/* Safety */}
          <Route path="crew-safety"   element={<CrewHeatSafety />} />
          <Route path="cold-storage"  element={<ColdStorageProtection />} />
          <Route path="food-safety"   element={<FoodSafetyGuard />} />

          {/* Alerts & Risks */}
          <Route path="environmental-risk" element={<EnvironmentalRiskCenter />} />
          <Route path="critical-alerts"    element={<CriticalConditionAlerts />} />
        </Routes>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardInner />
    </AppProvider>
  );
}
