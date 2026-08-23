import { Wind, AlertCircle, CheckCircle, XCircle, Siren } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

const AQI_LEVELS = {
  'Good':             { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  'Moderate':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  'Sensitive Groups': { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)' },
  'Unhealthy':        { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  'Very Unhealthy':   { color: '#9333ea', bg: 'rgba(147,51,234,0.12)',  border: 'rgba(147,51,234,0.3)' },
  'Hazardous':        { color: '#7f1d1d', bg: 'rgba(127,29,29,0.12)',   border: 'rgba(127,29,29,0.3)' },
};

function getAqiLevel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function AqiGauge({ aqi, level }) {
  const lvl = AQI_LEVELS[level] || AQI_LEVELS['Moderate'];
  const angle = Math.min((aqi / 300) * 180, 180);
  const rad = (angle - 180) * (Math.PI / 180);
  const needleX = 80 + 60 * Math.cos(rad);
  const needleY = 80 + 60 * Math.sin(rad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="160" height="90" viewBox="0 0 160 90">
        {[
          { color: '#22c55e', start: 0, end: 60 },
          { color: '#f59e0b', start: 60, end: 100 },
          { color: '#f97316', start: 100, end: 150 },
          { color: '#ef4444', start: 150, end: 200 },
          { color: '#9333ea', start: 200, end: 300 },
        ].map(({ color, start, end }) => {
          const s = Math.min(start / 300, 1) * 180;
          const e = Math.min(end / 300, 1) * 180;
          const sr = (s - 180) * (Math.PI / 180);
          const er = (e - 180) * (Math.PI / 180);
          const x1 = 80 + 70 * Math.cos(sr), y1 = 80 + 70 * Math.sin(sr);
          const x2 = 80 + 70 * Math.cos(er), y2 = 80 + 70 * Math.sin(er);
          const large = e - s > 90 ? 1 : 0;
          return <path key={color} d={`M ${x1} ${y1} A 70 70 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="8" strokeOpacity="0.4" />;
        })}
        <line x1="80" y1="80" x2={needleX} y2={needleY} stroke={lvl.color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="80" r="5" fill={lvl.color} />
        <text x="80" y="68" textAnchor="middle" fill={lvl.color} fontSize="22" fontWeight="800" fontFamily="Outfit, sans-serif">{aqi}</text>
        <text x="80" y="82" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">{level.toUpperCase()}</text>
      </svg>
    </div>
  );
}

export default function AirQualityView() {
  const { dashboardData, loading, error } = useApp();
  const current = dashboardData?.thermal?.current ?? {};
  const aqi = current?.aqi ?? 0;
  const level = getAqiLevel(aqi);
  const lvl = AQI_LEVELS[level] || AQI_LEVELS['Moderate'];
  const windSpeed = current?.wind_speed_ms;
  const humidity = current?.humidity_pct;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Wind size={24} color="var(--status-info)" />
            </div>
            <div>
              <h1 className="page-title">Air Quality View</h1>
              <p className="page-desc">
                Air quality index affecting crew health and food safety during operations.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Environmental Data</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Air Quality View</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Crew Safety</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Current AQI</span>
            <span className="metric-value" style={{ color: lvl.color }}>{aqi}</span>
            <span className="metric-sub">{level}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Wind Speed</span>
            <span className="metric-value">{windSpeed != null ? `${windSpeed.toFixed(1)} m/s` : '--'}</span>
            <span className="metric-sub">Current</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Humidity</span>
            <span className="metric-value">{humidity != null ? `${Math.round(humidity)}%` : '--'}</span>
            <span className="metric-sub">Relative</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Cloud Cover</span>
            <span className="metric-value">{current?.cloud_cover_pct != null ? `${Math.round(current.cloud_cover_pct)}%` : '--'}</span>
            <span className="metric-sub">Sky conditions</span>
          </div>
        </div>

        <div className="two-col">
          {/* AQI Gauge */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title"><Wind size={14} className="panel-title-icon" /> Live Air Quality Index</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', justifyContent: 'center', padding: '28px 20px' }}>
              <AqiGauge aqi={aqi} level={level} />
            </div>
          </div>

          {/* Environmental summary */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Environmental Summary</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'AQI', value: aqi, status: aqi > 150 ? 'critical' : aqi > 100 ? 'warning' : 'ok' },
                  { label: 'Wind Speed', value: windSpeed != null ? `${windSpeed.toFixed(1)} m/s` : '--', status: 'ok' },
                  { label: 'Humidity', value: humidity != null ? `${Math.round(humidity)}%` : '--', status: humidity > 80 ? 'warning' : 'ok' },
                  { label: 'Temperature', value: current?.temperature_c != null ? `${Math.round(current.temperature_c)}°C` : '--', status: current?.temperature_c > 38 ? 'critical' : 'ok' },
                ].map(cond => (
                  <div key={cond.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cond.label}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cond.value}</div>
                    </div>
                    <span className={`tag tag-${cond.status === 'critical' ? 'red' : cond.status === 'warning' ? 'yellow' : 'green'}`}>
                      {cond.status === 'critical' ? 'Critical' : cond.status === 'warning' ? 'Caution' : 'OK'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <span className="tag tag-teal">Source: {current?.source ?? 'Stub'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Guidance */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Operational Guidance by AQI Level</span>
          </div>
          <div className="panel-body">
            <div className="three-col">
              {[
                { Icon: CheckCircle, color: 'var(--status-ok)', condition: 'AQI < 100', rec: 'Normal operations — no restrictions needed' },
                { Icon: AlertCircle, color: 'var(--status-warning)', condition: 'AQI 100–150', rec: 'Sensitive crew use N95 mask during outdoor tasks' },
                { Icon: XCircle, color: 'var(--status-critical)', condition: 'AQI > 150', rec: 'Limit outdoor exposure; rotate crew every 30 min' },
              ].map(({ Icon, color, condition, rec }) => (
                <div key={condition} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Icon size={20} color={color} />
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color, fontSize: '0.85rem' }}>{condition}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</div>
                </div>
              ))}
            </div>
            {aqi > 200 && (
              <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: '#fca5a5' }}>
                <Siren size={16} color="var(--status-critical)" style={{ flexShrink: 0 }} />
                <span><strong>AQI &gt; 200:</strong> Suspend all outdoor operations and move crew to sheltered area immediately.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
