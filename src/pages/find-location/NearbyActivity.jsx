import { MapPin } from 'lucide-react';
import { nearbyActivityData } from '../../data/mockData';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEMAND_WIDTH = { 'Very High': '92%', High: '70%', Medium: '50%', Low: '30%' };

export default function NearbyActivity() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <MapPin size={24} color="var(--status-info)" />
          </div>
          <div>
            <h1 className="page-title">Nearby Activity Explorer</h1>
            <p className="page-desc">
              Points of interest, commercial zones, colleges, transit nodes, and tourist locations around your selected candidate.
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
          <span className="metric-value">18</span>
          <span className="metric-sub">Within 1km radius</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Nearest Demand</span>
          <span className="metric-value" style={{ fontSize: '1.2rem' }}>120m</span>
          <span className="metric-sub">IT Park Alpha</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">High-Demand POIs</span>
          <span className="metric-value" style={{ color: 'var(--brand-primary)' }}>4</span>
          <span className="metric-sub">Very High or High demand</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Dominant Type</span>
          <span className="metric-value" style={{ fontSize: '1.1rem' }}>Office</span>
          <span className="metric-sub">3,200 workers estimated</span>
        </div>
      </div>

      <div className="two-col">
        {/* POI Table */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><MapPin size={14} className="panel-title-icon" /> Nearby Points of Interest</span>
          </div>
          <div className="panel-body no-pad">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Distance</th>
                  <th>Demand</th>
                </tr>
              </thead>
              <tbody>
                {nearbyActivityData.map(poi => (
                  <tr key={poi.name}>
                    <td>{poi.name}</td>
                    <td>
                      <span className={`poi-type-badge poi-badge-${poi.type}`}>{poi.type}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{poi.distance}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="demand-bar">
                          <div className="demand-fill" style={{ width: DEMAND_WIDTH[poi.demand] || '50%' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{poi.demand}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini Map */}
        <div>
          <p className="section-title">POI Map</p>
          <div className="map-wrapper" style={{ height: 340 }}>
            <MapContainer center={[12.9698, 77.7499]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {nearbyActivityData.map(poi => (
                <Marker key={poi.name} position={[poi.lat, poi.lng]}>
                  <Popup>
                    <div style={{ color: '#111', fontFamily: 'Inter, sans-serif' }}>
                      <strong>{poi.name}</strong><br />
                      Type: {poi.type}<br />
                      Distance: {poi.distance}<br />
                      Demand: {poi.demand}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Type legend */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Office', 'College', 'Market', 'Transit', 'Commercial'].map(t => (
              <span key={t} className={`poi-type-badge poi-badge-${t}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
