import { Trees } from 'lucide-react';
import { shadeFinderData } from '../../data/mockData';
import { MapContainer, TileLayer, Circle, Tooltip as MapTooltip } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ShadeFinder() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(34,197,94,0.12)' }}>
            <Trees size={24} color="var(--status-ok)" />
          </div>
          <div>
            <h1 className="page-title">Shade Finder</h1>
            <p className="page-desc">
              Identify tree canopy, building shade, and lower solar-exposure parking spots near your candidate locations.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Candidate Location</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Shade Finder</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Better Parking Areas</span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Best Shade Score</span>
          <span className="metric-value" style={{ color: 'var(--brand-teal)' }}>96</span>
          <span className="metric-sub">Covered Walkway — Spot D</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Worst Spot</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>12</span>
          <span className="metric-sub">Open Lot — Spot C</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Full-Day Shade Spots</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)' }}>2</span>
          <span className="metric-sub">Both AM and PM coverage</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Recommended Spot</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>Spot D</span>
          <span className="metric-sub">10h shade, covered walkway</span>
        </div>
      </div>

      <div className="two-col">
        {/* Shade Cards */}
        <div>
          <p className="section-title">Shade Spots</p>
          <div className="shade-cards" style={{ gridTemplateColumns: '1fr' }}>
            {shadeFinderData
              .slice()
              .sort((a, b) => b.shadeScore - a.shadeScore)
              .map((spot, i) => (
                <div
                  key={spot.name}
                  className={`shade-card${i === 0 ? ' best-shade' : ''}`}
                >
                  <div className="shade-card-name">{spot.name}</div>
                  <div className="shade-card-meta">Shade hours per day: {spot.shadeHours}h</div>
                  <div className="shade-score-bar">
                    <div className="shade-score-fill" style={{ width: `${spot.shadeScore}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`shade-tag ${spot.morningShade ? 'yes' : 'no'}`}>
                        {spot.morningShade ? '☀ AM Shade' : '✗ No AM'}
                      </span>
                      <span className={`shade-tag ${spot.afternoonShade ? 'yes' : 'no'}`}>
                        {spot.afternoonShade ? '☀ PM Shade' : '✗ No PM'}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem',
                      color: spot.shadeScore > 80 ? 'var(--brand-teal)' : spot.shadeScore > 50 ? 'var(--brand-amber)' : 'var(--status-critical)'
                    }}>
                      {spot.shadeScore}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Map */}
        <div>
          <p className="section-title">Shade Map</p>
          <div className="map-wrapper" style={{ height: 400 }}>
            <MapContainer center={[12.9703, 77.7498]} zoom={17} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {shadeFinderData.map(spot => (
                <Circle
                  key={spot.name}
                  center={[spot.lat, spot.lng]}
                  radius={80}
                  pathOptions={{
                    color: spot.shadeScore > 80 ? '#2dd4bf' : spot.shadeScore > 50 ? '#f97316' : '#ef4444',
                    fillColor: spot.shadeScore > 80 ? '#2dd4bf' : spot.shadeScore > 50 ? '#f97316' : '#ef4444',
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <MapTooltip permanent direction="top" offset={[0, -8]}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
                      {spot.name.split('—')[0]} · Score: {spot.shadeScore}
                    </span>
                  </MapTooltip>
                </Circle>
              ))}
            </MapContainer>
          </div>
          <div style={{ marginTop: 10, fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', gap: 14 }}>
            {[{ c: '#2dd4bf', l: 'High Shade' }, { c: '#f97316', l: 'Moderate' }, { c: '#ef4444', l: 'Low Shade' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: x.c }} />
                {x.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
