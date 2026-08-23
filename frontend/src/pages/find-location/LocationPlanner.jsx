import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Route, MapPin, ChartNoAxesCombined, GitCompareArrows, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { useNavigate } from 'react-router-dom';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ScoreRing({ score, color }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div className="location-score-ring">
      <svg className="score-svg" viewBox="0 0 48 48">
        <circle className="score-track" cx="24" cy="24" r={r} />
        <circle className="score-fill" cx="24" cy="24" r={r} stroke={color} strokeDasharray={`${fill} ${circ}`} />
      </svg>
      <div className="score-label" style={{ color }}>{score}</div>
    </div>
  );
}

export default function LocationPlanner() {
  const { dashboardData, loading, error, location } = useApp();
  const navigate = useNavigate();

  const plan = dashboardData?.location_context?.plan ?? {};
  const current = dashboardData?.thermal?.current ?? {};
  const heatIndex = current?.heat_index_c ?? current?.temperature_c ?? null;

  // Build a single-location summary from dashboard data
  const suitability = plan?.suitability_score ?? plan?.overall_score ?? null;
  const score = suitability ?? (heatIndex ? Math.max(0, Math.round(100 - heatIndex * 1.5)) : null);
  const statusColor = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Route size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h1 className="page-title">Location Planner</h1>
              <p className="page-desc">
                Evaluate your current location for food-truck suitability. Change locations using the search bar above.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step current">Select Area</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">View Conditions</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Explore Location</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Compare</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Location</span>
            <span className="metric-value" style={{ fontSize: '1rem' }}>{location.city || 'Selected'}</span>
            <span className="metric-sub">{location.state ? `${location.state}, ${location.country}` : location.address}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Suitability Score</span>
            <span className="metric-value" style={{ color: statusColor }}>{score ?? '--'}</span>
            <span className="metric-sub">Food-truck suitability</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Current Heat Index</span>
            <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{heatIndex != null ? `${Math.round(heatIndex)}°C` : '--'}</span>
            <span className="metric-sub">Current conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Temperature</span>
            <span className="metric-value">{current?.temperature_c != null ? `${Math.round(current.temperature_c)}°C` : '--'}</span>
            <span className="metric-sub">Ambient</span>
          </div>
        </div>

        <div className="two-col">
          {/* Left: Location details + actions */}
          <div>
            <p className="section-title">Location Assessment</p>
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <ScoreRing score={score ?? 0} color={statusColor} />
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>{location.address || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Heat Index: {heatIndex != null ? `${Math.round(heatIndex)}°C` : '--'} · AQI: {current?.aqi ?? '--'} · Humidity: {current?.humidity_pct != null ? `${Math.round(current.humidity_pct)}%` : '--'}
                    </div>
                  </div>
                </div>

                {plan?.recommendations && Array.isArray(plan.recommendations) && plan.recommendations.length > 0 && (
                  <div className="safety-list">
                    <p className="section-title" style={{ marginBottom: 8 }}>Recommendations</p>
                    {plan.recommendations.map((rec, i) => (
                      <div key={i} className="safety-row status-ok">
                        <div className="safety-dot" />
                        <span className="safety-label">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">
                  <Navigation size={14} className="panel-title-icon" />
                  Explore: {location.city || 'This Location'}
                </span>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="layer-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/dashboard/nearby-activity')}>
                  <MapPin size={14} /> View Nearby Activity
                </button>
                <button className="layer-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/dashboard/business-potential')}>
                  <ChartNoAxesCombined size={14} /> Business Potential Insights
                </button>
                <button className="layer-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/dashboard/location-comparison')}>
                  <GitCompareArrows size={14} /> Compare Locations
                </button>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div>
            <p className="section-title">Area Map — {location.city || 'Location'}</p>
            <div className="map-wrapper" style={{ height: 480 }}>
              <MapContainer center={[location.lat, location.lon]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lon]}>
                  <Popup>
                    <div style={{ color: '#111', fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                      <strong>{location.city || 'Selected'}</strong><br />
                      Score: {score ?? '--'} | Heat: {heatIndex != null ? `${Math.round(heatIndex)}°C` : '--'}
                    </div>
                  </Popup>
                </Marker>
                <Circle center={[location.lat, location.lon]} radius={400} pathOptions={{ color: statusColor, fillColor: statusColor, fillOpacity: 0.12 }} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
