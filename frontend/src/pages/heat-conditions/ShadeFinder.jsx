import { Trees } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { MapContainer, TileLayer, Circle, Tooltip as MapTooltip } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ShadeFinder() {
  const { dashboardData, loading, error, location } = useApp();
  const shadeRaw = dashboardData?.thermal?.shade;
  const assessment = shadeRaw?.shade_assessment ?? {};
  const greenAreas = shadeRaw?.green_areas ?? [];

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <Trees size={24} color="var(--status-ok)" />
            </div>
            <div>
              <h1 className="page-title">Shade Finder</h1>
              <p className="page-desc">
                Potential shade areas based on satellite and street-view segmentation. Identify tree canopy, building shade, and lower solar-exposure spots.
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
            <span className="metric-label">Shade Score</span>
            <span className="metric-value" style={{ color: 'var(--brand-teal)' }}>{assessment.shade_score ?? '--'}</span>
            <span className="metric-sub">0 = no shade, 100 = full</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Shade Quality</span>
            <span className="metric-value" style={{ fontSize: '1rem' }}>{assessment.shade_quality ?? '--'}</span>
            <span className="metric-sub">Site assessment</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Tree Canopy</span>
            <span className="metric-value" style={{ color: 'var(--status-ok)' }}>{assessment.tree_canopy_pct != null ? `${Math.round(assessment.tree_canopy_pct)}%` : '--'}</span>
            <span className="metric-sub">Vegetation coverage</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Building Shade</span>
            <span className="metric-value">{assessment.building_shade_pct != null ? `${Math.round(assessment.building_shade_pct)}%` : '--'}</span>
            <span className="metric-sub">Structural shade</span>
          </div>
        </div>

        <div className="two-col">
          {/* Shade Details */}
          <div>
            <p className="section-title">Shade Assessment</p>
            <div className="panel">
              <div className="panel-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Shade Score', value: assessment.shade_score, unit: '/100', color: assessment.shade_score > 60 ? 'var(--status-ok)' : assessment.shade_score > 35 ? 'var(--brand-amber)' : 'var(--status-critical)' },
                    { label: 'Tree Canopy', value: assessment.tree_canopy_pct != null ? Math.round(assessment.tree_canopy_pct) : null, unit: '%', color: 'var(--status-ok)' },
                    { label: 'Building Shade', value: assessment.building_shade_pct != null ? Math.round(assessment.building_shade_pct) : null, unit: '%', color: 'var(--brand-amber)' },
                    { label: 'Vegetation Cover', value: assessment.vegetation_cover_pct != null ? Math.round(assessment.vegetation_cover_pct) : null, unit: '%', color: 'var(--brand-teal)' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.value != null ? `${item.value}${item.unit}` : '--'}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.value ?? 0}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                {assessment.note && (
                  <p style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ⚠ {assessment.note}
                  </p>
                )}
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag tag-teal">Source: {shadeRaw?.data_source ?? 'Stub'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <p className="section-title">Area Map — {location.city || 'Location'}</p>
            <div className="map-wrapper" style={{ height: 400 }}>
              <MapContainer center={[location.lat, location.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* Center marker circle */}
                <Circle
                  center={[location.lat, location.lon]}
                  radius={200}
                  pathOptions={{
                    color: assessment.shade_score > 60 ? '#2dd4bf' : assessment.shade_score > 35 ? '#f97316' : '#ef4444',
                    fillColor: assessment.shade_score > 60 ? '#2dd4bf' : assessment.shade_score > 35 ? '#f97316' : '#ef4444',
                    fillOpacity: 0.25, weight: 2,
                  }}
                >
                  <MapTooltip permanent direction="top" offset={[0, -8]}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
                      Shade Score: {assessment.shade_score ?? '--'}
                    </span>
                  </MapTooltip>
                </Circle>
                {/* Green areas from satellite */}
                {greenAreas.map((area, i) => (
                  <Circle key={i}
                    center={[area.lat ?? location.lat, area.lon ?? location.lon]}
                    radius={area.radius_m ?? 80}
                    pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.3, weight: 1 }}
                  >
                    <MapTooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 11 }}>Green Area</span>
                    </MapTooltip>
                  </Circle>
                ))}
              </MapContainer>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[{ c: '#2dd4bf', l: 'High Shade' }, { c: '#f97316', l: 'Moderate' }, { c: '#ef4444', l: 'Low Shade' }, { c: '#22c55e', l: 'Green Areas' }].map(x => (
                <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: x.c }} />{x.l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
