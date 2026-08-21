import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Pages
import LocationPlanner from './pages/find-location/LocationPlanner';
import LocationComparison from './pages/find-location/LocationComparison';
import BusinessPotential from './pages/find-location/BusinessPotential';
import NearbyActivity from './pages/find-location/NearbyActivity';
import HeatOutlook from './pages/heat-conditions/HeatOutlook';
import LocalHeatMap from './pages/heat-conditions/LocalHeatMap';
import ShadeFinder from './pages/heat-conditions/ShadeFinder';
import SolarExposure from './pages/heat-conditions/SolarExposure';
import UrbanHeatInsights from './pages/heat-conditions/UrbanHeatInsights';
import OperatingWindowPlanner from './pages/plan-operations/OperatingWindowPlanner';
import CrewHeatSafety from './pages/safety/CrewHeatSafety';
import ColdStorageProtection from './pages/safety/ColdStorageProtection';
import FoodSafetyGuard from './pages/safety/FoodSafetyGuard';
import EnvironmentalRiskCenter from './pages/alerts-risks/EnvironmentalRiskCenter';
import CriticalConditionAlerts from './pages/alerts-risks/CriticalConditionAlerts';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="main-content">
          <TopBar alertCount={2} />
          <Routes>
            <Route path="/" element={<Navigate to="/location-planner" replace />} />
            <Route path="/location-planner" element={<LocationPlanner />} />
            <Route path="/location-comparison" element={<LocationComparison />} />
            <Route path="/business-potential" element={<BusinessPotential />} />
            <Route path="/nearby-activity" element={<NearbyActivity />} />
            <Route path="/heat-outlook" element={<HeatOutlook />} />
            <Route path="/local-heat-map" element={<LocalHeatMap />} />
            <Route path="/shade-finder" element={<ShadeFinder />} />
            <Route path="/solar-exposure" element={<SolarExposure />} />
            <Route path="/urban-heat" element={<UrbanHeatInsights />} />
            <Route path="/operating-window" element={<OperatingWindowPlanner />} />
            <Route path="/crew-safety" element={<CrewHeatSafety />} />
            <Route path="/cold-storage" element={<ColdStorageProtection />} />
            <Route path="/food-safety" element={<FoodSafetyGuard />} />
            <Route path="/environmental-risk" element={<EnvironmentalRiskCenter />} />
            <Route path="/critical-alerts" element={<CriticalConditionAlerts />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
