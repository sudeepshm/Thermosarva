import { MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function NearbyActivity() {
  const { dashboardData, loading, error, location } = useApp();
  const nearbyRaw = dashboardData?.location_context?.nearby;

  // Backend returns POIs from OpenStreetMap
  const pois = nearbyRaw?.pois ?? nearbyRaw?.results ?? [];
  const categories = nearbyRaw?.categories ?? {};
  const totalPois = Array.isArray(pois) ? pois.length : 0;

  // Category summary
  const catSummary = Object.entries(categories).map(([cat, items]) => ({
    category: cat,
    count: Array.isArray(items) ? items.length : 0,
  })).sort((a, b) => b.count - a.count);

  const dominantType = catSummary[0]?.category ?? 'N/A';

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <MapPin size={24} color="var(--status-info)" />
            </div>
            <div>
              <h1 className="page-title">Nearby Activity Explorer</h1>
              <p className="page-desc">
                Points of interest from OpenStreetMap around {location.city || 'your selected location'}.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Location Planner</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Selected Location</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Nearby Activity Explorer</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Total POIs</span>
            <span className="metric-value">{totalPois}</span>
            <span className="metric-sub">Within search radius</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Categories</span>
            <span className="metric-value">{catSummary.length}</span>
            <span className="metric-sub">Types of places</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Dominant Type</span>
            <span className="metric-value" style={{ fontSize: '1rem' }}>{dominantType}</span>
            <span className="metric-sub">{catSummary[0]?.count ?? 0} locations</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Source</span>
            <span className="metric-value" style={{ fontSize: '0.85rem' }}>OpenStreetMap</span>
            <span className="metric-sub">Overpass API</span>
          </div>
        </div>

        <div className="two-col">
          {/* POI Categories List */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title"><MapPin size={14} className="panel-title-icon" /> Nearby Points of Interest</span>
            </div>
            <div className="panel-body">
              {totalPois > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {catSummary.map(cat => (
                    <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <MapPin size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{cat.category.replace(/_/g, ' ')}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{cat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                  {nearbyRaw ? 'No POIs found nearby.' : 'POI data loading…'}
                </div>
              )}

              {/* Individual POIs if available */}
              {pois.length > 0 && (
                <>
                  <div className="divider" />
                  <p className="section-title">Individual Locations ({Math.min(pois.length, 20)} shown)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {pois.slice(0, 20).map((poi, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)', fontSize: '0.82rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', flexShrink: 0 }} />
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{poi.name || poi.tags?.name || `POI #${i + 1}`}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{poi.category || poi.type || ''}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <p className="section-title">POI Map — {location.city || 'Location'}</p>
            <div className="map-wrapper" style={{ height: 400 }}>
              <MapContainer center={[location.lat, location.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* Center marker */}
                <Circle center={[location.lat, location.lon]} radius={50} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.6 }} />
                {/* POI markers */}
                {pois.filter(p => p.lat && p.lon).slice(0, 30).map((poi, i) => (
                  <Marker key={i} position={[poi.lat, poi.lon]}>
                    <Popup>
                      <div style={{ color: '#111', fontFamily: 'Inter, sans-serif' }}>
                        <strong>{poi.name || `POI #${i + 1}`}</strong><br />
                        {poi.category || poi.type || ''}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
