import { HardHat, Droplets, Thermometer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_CONFIG = {
  NORMAL:    { color: 'var(--status-ok)',       bg: 'var(--status-ok-dim)',       label: 'Normal' },
  CAUTION:   { color: 'var(--brand-amber)',     bg: 'rgba(251,191,36,0.12)',      label: 'Caution' },
  HIGH_HEAT: { color: 'var(--status-warning)',  bg: 'var(--status-warning-dim)',  label: 'High Heat' },
  CRITICAL:  { color: 'var(--status-critical)', bg: 'var(--status-critical-dim)', label: 'Critical' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Break freq: {payload[0]?.value} min</div>
    </div>
  );
};

export default function CrewHeatSafety() {
  const { dashboardData, loading, error } = useApp();
  const data = dashboardData?.safety?.crew ?? {};

  const category  = data.category ?? 'NORMAL';
  const cfg       = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.NORMAL;
  const heatIndex = data.heat_index_c;
  const temp      = data.temperature_c;
  const aqi       = data.aqi;
  const aqiLevel  = data.aqi_level ?? '--';
  const breakFreq = data.recommended_break_frequency_minutes;
  const duration  = data.operating_duration_hours;
  const recs      = data.recommendations ?? [];

  // Build a simple bar showing break frequency vs heat category levels
  const breakChart = [
    { label: 'Normal', freq: 60 },
    { label: 'Caution', freq: 45 },
    { label: 'High Heat', freq: 30 },
    { label: 'Critical', freq: 20 },
  ].map(b => ({ ...b, active: b.freq === breakFreq }));

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <HardHat size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h1 className="page-title">Crew Heat Safety</h1>
              <p className="page-desc">
                Heat exposure risk for outdoor crew based on external environmental conditions. No wearable/IoT data — environment only.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Selected Location</span>
            <span className="dep-arrow">+</span>
            <span className="dep-step">Operating Window</span>
            <span className="dep-arrow">+</span>
            <span className="dep-step">Thermal Conditions</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Crew Heat Safety</span>
          </div>
        </div>

        {/* Status banner */}
        <div style={{
          background: `linear-gradient(90deg, ${cfg.bg}, transparent)`,
          border: `1px solid ${cfg.color}44`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 20,
        }}>
          <HardHat size={24} color={cfg.color} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Crew Risk: {cfg.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Heat index {heatIndex != null ? `${Math.round(heatIndex)}°C` : '--'} · AQI Level: {aqiLevel} · Break every {breakFreq ?? '--'} min
            </div>
          </div>
          {aqiLevel === 'UNHEALTHY' || aqiLevel === 'VERY_UNHEALTHY' || aqiLevel === 'HAZARDOUS' ? (
            <span className="tag tag-red" style={{ marginLeft: 'auto' }}>
              <Droplets size={10} /> Poor Air Quality
            </span>
          ) : null}
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Heat Index</span>
            <span className="metric-value" style={{ color: cfg.color }}>{heatIndex != null ? `${Math.round(heatIndex)}°C` : '--'}</span>
            <span className="metric-sub">{cfg.label} risk zone</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Ambient Temp</span>
            <span className="metric-value" style={{ fontSize: '1.2rem' }}>{temp != null ? `${Math.round(temp)}°C` : '--'}</span>
            <span className="metric-sub">External conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Break Frequency</span>
            <span className="metric-value" style={{ color: cfg.color, fontSize: '1.2rem' }}>{breakFreq != null ? `${breakFreq} min` : '--'}</span>
            <span className="metric-sub">Mandatory rest interval</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">AQI</span>
            <span className="metric-value">{aqi != null ? aqi : '--'}</span>
            <span className="metric-sub">{aqiLevel}</span>
          </div>
        </div>

        <div className="two-col">
          {/* Break frequency chart */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title"><Thermometer size={14} className="panel-title-icon" /> Break Frequency by Risk Level</span>
            </div>
            <div className="panel-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 70]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit=" min" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="freq" name="Break Freq" radius={[3, 3, 0, 0]}>
                      {breakChart.map((d, i) => (
                        <Cell key={i} fill={d.active ? cfg.color : 'rgba(255,255,255,0.1)'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p style={{ marginTop: 8, fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Active level highlighted: <strong style={{ color: cfg.color }}>{cfg.label}</strong>
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Safety Recommendations — Current Conditions</span>
            </div>
            <div className="panel-body">
              <div className="safety-list">
                {recs.length > 0 ? recs.map((rec, i) => (
                  <div key={i} className={`safety-row status-${category === 'CRITICAL' ? 'critical' : category === 'HIGH_HEAT' ? 'warning' : 'ok'}`}>
                    <div className="safety-dot" />
                    <span className="safety-label">{rec}</span>
                  </div>
                )) : (
                  <div className="safety-row status-ok">
                    <div className="safety-dot" />
                    <span className="safety-label">Comfortable conditions. Standard protocols apply.</span>
                  </div>
                )}
              </div>

              <div className="divider" />

              <p className="section-title">Heat Illness Signs to Watch</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {[
                  { sign: 'Heavy sweating or no sweating', severity: 'warning' },
                  { sign: 'Dizziness or confusion', severity: 'critical' },
                  { sign: 'Nausea or vomiting', severity: 'critical' },
                  { sign: 'Muscle cramps', severity: 'warning' },
                  { sign: 'Hot, red or damp skin', severity: 'critical' },
                ].map(s => (
                  <div key={s.sign} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: s.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-warning)'
                    }} />
                    {s.sign}
                  </div>
                ))}
              </div>

              {data.disclaimer && (
                <p style={{ marginTop: 14, fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>⚠ {data.disclaimer}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
