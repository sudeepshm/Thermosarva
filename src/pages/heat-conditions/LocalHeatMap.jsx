import { useState } from 'react';
import { Map, Thermometer, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Tooltip as MapTooltip, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { candidateLocations } from '../../data/mockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LAYERS = ['Heat Index', 'Surface Temp', 'Urban Heat Island'];

function heatColor(heatIndex) {
  if (heatIndex >= 43) return '#ef4444';
  if (heatIndex >= 38) return '#f59e0b';
  if (heatIndex >= 33) return '#f97316';
  return '#22c55e';
}

export default function LocalHeatMap() {
  const [activeLayer, setActiveLayer] = useState('Heat Index');

  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Map size={24} color="var(--status-critical)" />
          </div>
          <div>
            <h1 className="page-title">Local Heat Map</h1>
            <p className="page-desc">
              Visualise thermal conditions across your operating area. Switch between heat index, surface temperature, and urban heat island layers.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Selected Area</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Local Heat Map</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Urban Heat Insights</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Location Comparison</span>
        </div>
      </div>

      {/* Layer controls (Sentinel Hub / Windy-style) */}
      <div className="map-layer-controls">
        {LAYERS.map(layer => (
          <button
            key={layer}
            className={`layer-btn${activeLayer === layer ? ' active' : ''}`}
            onClick={() => setActiveLayer(layer)}
          >
            <Layers size={12} />
            {layer}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="map-wrapper" style={{ height: 460 }}>
        <MapContainer center={[12.9600, 77.6800]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {candidateLocations.map(loc => (
            <Circle
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={600}
              pathOptions={{
                color: heatColor(loc.heatIndex),
                fillColor: heatColor(loc.heatIndex),
                fillOpacity: 0.35,
                weight: 1.5,
              }}
            >
              <MapTooltip permanent direction="top" offset={[0, -8]}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                  <strong>{loc.name.split(',')[0]}</strong><br />
                  {activeLayer}: {loc.heatIndex}°C
                </div>
              </MapTooltip>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Heat gradient legend */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="section-title">Heat Legend — {activeLayer}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 16, borderRadius: 8, overflow: 'hidden', maxWidth: 400 }}>
          {['#22c55e', '#84cc16', '#f97316', '#f59e0b', '#ef4444', '#dc2626'].map(c => (
            <div key={c} style={{ flex: 1, height: '100%', background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 400, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Comfortable (28°C)</span><span>Critical (44°C+)</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="metric-grid" style={{ marginTop: 20 }}>
        {candidateLocations.map(loc => (
          <div className="metric-card" key={loc.id}>
            <span className="metric-label">{loc.name.split(',')[0]}</span>
            <span className="metric-value" style={{ color: heatColor(loc.heatIndex) }}>{loc.heatIndex}°C</span>
            <span className="metric-sub">Heat Index · {loc.urbanHeat} UHI</span>
          </div>
        ))}
      </div>
    </div>
  );
}
