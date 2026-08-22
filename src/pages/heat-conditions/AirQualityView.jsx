import { Wind, AlertCircle, CheckCircle, XCircle, Siren } from 'lucide-react';
import { airQualityData } from '../../data/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const AQI_LEVELS = {
  'Good':             { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  'Moderate':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  'Sensitive Groups': { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)' },
  'Unhealthy':        { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  'Very Unhealthy':   { color: '#9333ea', bg: 'rgba(147,51,234,0.12)',  border: 'rgba(147,51,234,0.3)' },
  'Hazardous':        { color: '#7f1d1d', bg: 'rgba(127,29,29,0.12)',   border: 'rgba(127,29,29,0.3)' },
};

const STATUS_COLORS = {
  ok: 'var(--status-ok)',
  warning: 'var(--status-warning)',
  critical: 'var(--status-critical)',
};

function AqiGauge({ aqi, level }) {
  const lvl = AQI_LEVELS[level] || AQI_LEVELS['Unhealthy'];
  const angle = Math.min((aqi / 300) * 180, 180);
  const rad = (angle - 180) * (Math.PI / 180);
  const needleX = 80 + 60 * Math.cos(rad);
  const needleY = 80 + 60 * Math.sin(rad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Track arcs */}
        {[
          { color: '#22c55e', start: 0,   end: 60  },
          { color: '#f59e0b', start: 60,  end: 100 },
          { color: '#f97316', start: 100, end: 150 },
          { color: '#ef4444', start: 150, end: 200 },
          { color: '#9333ea', start: 200, end: 300 },
        ].map(({ color, start, end }) => {
          const s = Math.min(start / 300, 1) * 180;
          const e = Math.min(end / 300, 1) * 180;
          const sr = (s - 180) * (Math.PI / 180);
          const er = (e - 180) * (Math.PI / 180);
          const x1 = 80 + 70 * Math.cos(sr);
          const y1 = 80 + 70 * Math.sin(sr);
          const x2 = 80 + 70 * Math.cos(er);
          const y2 = 80 + 70 * Math.sin(er);
          const large = e - s > 90 ? 1 : 0;
          return (
            <path
              key={color}
              d={`M ${x1} ${y1} A 70 70 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeOpacity="0.4"
            />
          );
        })}
        {/* Needle */}
        <line x1="80" y1="80" x2={needleX} y2={needleY} stroke={lvl.color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="80" r="5" fill={lvl.color} />
        {/* AQI label */}
        <text x="80" y="68" textAnchor="middle" fill={lvl.color} fontSize="22" fontWeight="800" fontFamily="Outfit, sans-serif">{aqi}</text>
        <text x="80" y="82" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">{level.toUpperCase()}</text>
      </svg>
      <div style={{
        background: lvl.bg,
        border: `1px solid ${lvl.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '10px 20px',
        textAlign: 'center',
        maxWidth: 320,
        fontSize: '0.82rem',
        color: '#f1f5f9',
        lineHeight: 1.5,
      }}>
        {airQualityData.current.operationalImpact}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AirQualityView() {
  const { current, hourly, pollutants } = airQualityData;
  const lvl = AQI_LEVELS[current.level] || AQI_LEVELS['Unhealthy'];

  return (
    <div className="page-scroll">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Wind size={24} color="var(--status-info)" />
          </div>
          <div>
            <h1 className="page-title">Air Quality View</h1>
            <p className="page-desc">
              Monitor air quality index and pollutant levels affecting crew health and food safety during operations.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Heat Data</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">AQI Data</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Air Quality View</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Current AQI</span>
          <span className="metric-value" style={{ color: lvl.color }}>{current.aqi}</span>
          <span className="metric-sub">{current.level}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">PM2.5</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{current.pm25}</span>
          <span className="metric-sub">µg/m³ (limit: 35)</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Dominant Pollutant</span>
          <span className="metric-value" style={{ fontSize: '1.3rem' }}>{current.dominantPollutant}</span>
          <span className="metric-sub">Primary concern today</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Peak AQI Hour</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)', fontSize: '1.3rem' }}>1 PM</span>
          <span className="metric-sub">AQI reaches 162</span>
        </div>
      </div>

      <div className="two-col">
        {/* Left: Gauge */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Wind size={14} className="panel-title-icon" /> Live Air Quality Index</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', justifyContent: 'center', padding: '28px 20px' }}>
            <AqiGauge aqi={current.aqi} level={current.level} />
          </div>
        </div>

        {/* Right: Pollutants */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Pollutant Breakdown</span>
          </div>
          <div className="panel-body no-pad">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pollutant</th>
                  <th>Value</th>
                  <th>Safe Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pollutants.map(p => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: STATUS_COLORS[p.status] }}>{p.value} {p.unit}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.limit} {p.unit}</td>
                    <td>
                      <span className={`tag tag-${p.status === 'ok' ? 'green' : p.status === 'warning' ? 'yellow' : 'red'}`}>
                        {p.status === 'ok' ? 'OK' : p.status === 'warning' ? 'Elevated' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hourly AQI Chart */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">12-Hour AQI Trend</span>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
            {[
              { color: '#22c55e', label: 'Good (<100)' },
              { color: '#f59e0b', label: 'Moderate (100–150)' },
              { color: '#ef4444', label: 'Unhealthy (>150)' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: i.color, borderRadius: 2 }} />
                {i.label}
              </div>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="chart-container-tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 180]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="rgba(245,158,11,0.4)" strokeDasharray="4 4" label={{ value: 'Moderate', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={150} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Unhealthy', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="aqi" name="AQI" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradAqi)" />
              </AreaChart>
            </ResponsiveContainer>
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
              { Icon: CheckCircle, color: 'var(--status-ok)',       condition: 'AQI < 100',  rec: 'Normal operations — no restrictions needed' },
              { Icon: AlertCircle, color: 'var(--status-warning)',   condition: 'AQI 100–150',rec: 'Sensitive crew use N95 mask during outdoor tasks' },
              { Icon: XCircle,     color: 'var(--status-critical)',  condition: 'AQI > 150',  rec: 'Limit outdoor exposure; rotate crew every 30 min' },
            ].map(({ Icon, color, condition, rec }) => (
              <div key={condition} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <Icon size={20} color={color} />
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, color, fontSize: '0.85rem' }}>{condition}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.82rem',
            color: '#fca5a5',
          }}>
            <Siren size={16} color="var(--status-critical)" style={{ flexShrink: 0 }} />
            <span><strong>AQI &gt; 200:</strong> Suspend all outdoor operations and move crew to sheltered area immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
