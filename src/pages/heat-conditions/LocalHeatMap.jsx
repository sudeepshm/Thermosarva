import { useState } from 'react';
import { Map, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Tooltip as MapTooltip } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

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
  const { dashboardData, loading, error, location } = useApp();

  const heatmapRaw = dashboardData?.thermal?.heatmap;
  const thermalLayer = heatmapRaw?.thermal_layer;
  const features = thermalLayer?.features ?? [];
  const current = dashboardData?.thermal?.current ?? {};
  const hi = current?.heat_index_c ?? current?.temperature_c ?? 30;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Map size={24} color="var(--status-critical)" />
            </div>
            <div>
              <h1 className="page-title">Local Heat Map</h1>
              <p className="page-desc">
                Visualise thermal conditions across your operating area. GeoJSON thermal zones from FortyGuard.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Selected Area</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Local Heat Map</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Urban Heat Insights</span>
          </div>
        </div>

        {/* Layer controls */}
        <div className="map-layer-controls">
          {LAYERS.map(layer => (
            <button key={layer} className={`layer-btn${activeLayer === layer ? ' active' : ''}`} onClick={() => setActiveLayer(layer)}>
              <Layers size={12} />{layer}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="map-wrapper" style={{ height: 460 }}>
          <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {features.length > 0 ? features.map((f, i) => {
              const coords = f.geometry?.coordinates ?? [location.lon, location.lat];
              const temp = f.properties?.temperature ?? hi;
              const radius = f.properties?.radius_m ?? 500;
              return (
                <Circle key={i} center={[coords[1], coords[0]]} radius={radius}
                  pathOptions={{ color: heatColor(temp), fillColor: heatColor(temp), fillOpacity: 0.35, weight: 1.5 }}>
                  <MapTooltip permanent={i === 0} direction="top" offset={[0, -8]}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                      <strong>{Math.round(temp)}°C</strong>
                    </div>
                  </MapTooltip>
                </Circle>
              );
            }) : (
              <Circle center={[location.lat, location.lon]} radius={500}
                pathOptions={{ color: heatColor(hi), fillColor: heatColor(hi), fillOpacity: 0.35, weight: 1.5 }}>
                <MapTooltip permanent direction="top" offset={[0, -8]}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11 }}>Heat Index: {Math.round(hi)}°C</span>
                </MapTooltip>
              </Circle>
            )}
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

        {/* Summary */}
        <div className="metric-grid" style={{ marginTop: 20 }}>
          <div className="metric-card">
            <span className="metric-label">Heat Index</span>
            <span className="metric-value" style={{ color: heatColor(hi) }}>{Math.round(hi)}°C</span>
            <span className="metric-sub">Current conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Temperature</span>
            <span className="metric-value">{current?.temperature_c != null ? `${Math.round(current.temperature_c)}°C` : '--'}</span>
            <span className="metric-sub">Ambient</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Thermal Zones</span>
            <span className="metric-value">{features.length || 1}</span>
            <span className="metric-sub">On map</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Source</span>
            <span className="metric-value" style={{ fontSize: '0.85rem' }}>{heatmapRaw?.data_source ?? 'Stub'}</span>
            <span className="metric-sub">{location.city || ''}</span>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
