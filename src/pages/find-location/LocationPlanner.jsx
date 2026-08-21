import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Route, MapPin, ChartNoAxesCombined, GitCompareArrows, Navigation } from 'lucide-react';
import { candidateLocations } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = { best: '#f97316', good: '#22c55e', caution: '#f59e0b', critical: '#ef4444' };

function ScoreRing({ score, status }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = STATUS_COLORS[status] || '#94a3b8';
  return (
    <div className="location-score-ring">
      <svg className="score-svg" viewBox="0 0 48 48">
        <circle className="score-track" cx="24" cy="24" r={r} />
        <circle
          className="score-fill"
          cx="24" cy="24" r={r}
          stroke={color}
          strokeDasharray={`${fill} ${circ}`}
        />
      </svg>
      <div className="score-label" style={{ color }}>{score}</div>
    </div>
  );
}

export default function LocationPlanner() {
  const [selected, setSelected] = useState(candidateLocations[2]);
  const navigate = useNavigate();

  return (
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
              Discover and evaluate candidate locations for your food-truck operation. Select an area, view ranked spots, and deep-dive into each.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step current">Select Area</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">View Candidates</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Explore Location</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Compare</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Candidate Locations</span>
          <span className="metric-value">4</span>
          <span className="metric-sub">In selected area</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Score</span>
          <span className="metric-value" style={{ color: 'var(--brand-primary)' }}>93</span>
          <span className="metric-sub">Indiranagar — University Zone</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg Heat Index</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>39°C</span>
          <span className="metric-sub">Across all candidates</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Critical Locations</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>1</span>
          <span className="metric-sub">Avoid during peak hours</span>
        </div>
      </div>

      <div className="two-col">
        {/* Left: Candidate List */}
        <div>
          <p className="section-title">Candidate Locations</p>
          <div className="location-list">
            {candidateLocations
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((loc, i) => (
                <div
                  key={loc.id}
                  className={`location-card${selected?.id === loc.id ? ' selected' : ''}${loc.status === 'best' ? ' best-rank' : ''}`}
                  onClick={() => setSelected(loc)}
                >
                  <div className="location-rank">{i + 1}</div>
                  <div className="location-info">
                    <div className="location-name">{loc.name}</div>
                    <div className="location-meta">
                      Heat Index {loc.heatIndex}°C · Shade: {loc.shade} · POIs: {loc.nearbyPOI}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className={`tag tag-${loc.status === 'best' ? 'orange' : loc.status === 'critical' ? 'red' : loc.status === 'caution' ? 'yellow' : 'green'}`}>
                        {loc.status === 'best' ? '★ Best' : loc.status === 'critical' ? '⚠ High Risk' : loc.status === 'caution' ? '⚡ Caution' : '✓ Good'}
                      </span>
                      <span className="tag tag-teal">BP: {loc.businessPotential}</span>
                    </div>
                  </div>
                  <ScoreRing score={loc.score} status={loc.status} />
                </div>
              ))}
          </div>

          {/* Quick actions for selected */}
          {selected && (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-header">
                <span className="panel-title">
                  <Navigation size={14} className="panel-title-icon" />
                  Explore: {selected.name}
                </span>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="layer-btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  onClick={() => navigate('/nearby-activity')}
                >
                  <MapPin size={14} /> View Nearby Activity
                </button>
                <button
                  className="layer-btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  onClick={() => navigate('/business-potential')}
                >
                  <ChartNoAxesCombined size={14} /> Business Potential Insights
                </button>
                <button
                  className="layer-btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  onClick={() => navigate('/location-comparison')}
                >
                  <GitCompareArrows size={14} /> Compare All Locations
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div>
          <p className="section-title">Area Map</p>
          <div className="map-wrapper" style={{ height: 480 }}>
            <MapContainer
              center={[12.9698, 77.7499]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {candidateLocations.map(loc => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div style={{ color: '#111', fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                      <strong>{loc.name}</strong><br />
                      Score: {loc.score} | Heat: {loc.heatIndex}°C<br />
                      Business Potential: {loc.businessPotential}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {selected && (
                <Circle
                  center={[selected.lat, selected.lng]}
                  radius={300}
                  pathOptions={{
                    color: STATUS_COLORS[selected.status],
                    fillColor: STATUS_COLORS[selected.status],
                    fillOpacity: 0.15,
                  }}
                />
              )}
            </MapContainer>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Best', color: '#f97316' }, { label: 'Good', color: '#22c55e' },
              { label: 'Caution', color: '#f59e0b' }, { label: 'Critical', color: '#ef4444' }
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
