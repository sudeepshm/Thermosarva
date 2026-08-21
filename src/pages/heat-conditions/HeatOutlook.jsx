import { Clock3, Thermometer, Droplets, Wind } from 'lucide-react';
import { heatOutlookData } from '../../data/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const RISK_COLORS = { low: '#22c55e', moderate: '#84cc16', high: '#f59e0b', critical: '#ef4444' };
const RISK_BG = { low: '#16a34a33', moderate: '#65a30d33', high: '#d9770633', critical: '#dc262633' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Temp: {d?.temp}°C</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#ef4444' }} />Heat Index: {d?.heatIndex}°C</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#3b82f6' }} />UV Index: {d?.uvIndex}</div>
      <div style={{ marginTop: 6 }}>
        <span style={{
          background: RISK_BG[d?.risk], color: RISK_COLORS[d?.risk],
          padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700
        }}>
          {d?.risk?.toUpperCase()} RISK
        </span>
      </div>
    </div>
  );
};

export default function HeatOutlook() {
  const currentHour = heatOutlookData[5]; // 11 AM
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <Clock3 size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">12-Hour Heat Outlook</h1>
            <p className="page-desc">
              Hourly temperature, heat index, and UV projections for the next 12 hours. Foundation for operating window planning and safety decisions.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step current">12-Hour Heat Outlook</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Operating Window Planner</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Crew Safety</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Food Safety Guard</span>
        </div>
      </div>

      {/* Current conditions */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Current Temp</span>
          <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>37°C</span>
          <span className="metric-sub">At 11 AM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Heat Index Now</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>42°C</span>
          <span className="metric-badge" style={{ background: 'var(--status-critical-dim)', color: 'var(--status-critical)', marginTop: 4 }}>High Risk</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Peak Heat Index</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>48°C</span>
          <span className="metric-sub">1 PM – 2 PM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">UV Index Peak</span>
          <span className="metric-value">10</span>
          <span className="metric-sub">12 PM – 1 PM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Safe Hours Today</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)' }}>6</span>
          <span className="metric-sub">6 AM–9 AM · 5 PM+</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avoid Window</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>11:30–4:30</span>
          <span className="metric-badge" style={{ background: 'var(--status-critical-dim)', color: 'var(--status-critical)', marginTop: 4 }}>Critical</span>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="panel mb-20">
        <div className="panel-header">
          <span className="panel-title"><Thermometer size={14} className="panel-title-icon" /> Temperature & Heat Index Forecast</span>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
            {[{ color: '#f97316', label: 'Temperature' }, { color: '#ef4444', label: 'Heat Index' }].map(i => (
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
              <AreaChart data={heatOutlookData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradHeat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[24, 52]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={40} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Critical 40°C', fill: '#ef4444', fontSize: 10 }} />
                <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fill="url(#gradTemp)" name="Temp" />
                <Area type="monotone" dataKey="heatIndex" stroke="#ef4444" strokeWidth={2} fill="url(#gradHeat)" name="Heat Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly risk strip */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Hourly Risk Band</span>
        </div>
        <div className="panel-body">
          <div className="timeline-strip">
            {heatOutlookData.map(d => (
              <div
                key={d.hour}
                className="timeline-cell"
                style={{ background: RISK_COLORS[d.risk] + '33', color: RISK_COLORS[d.risk] }}
                title={`${d.hour}: ${d.risk} risk`}
              >
                {d.risk === 'critical' ? '🔴' : d.risk === 'high' ? '🟠' : d.risk === 'moderate' ? '🟡' : '🟢'}
              </div>
            ))}
          </div>
          <div className="timeline-labels">
            {heatOutlookData.filter((_, i) => i % 2 === 0).map(d => (
              <span key={d.hour}>{d.hour}</span>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: '0.73rem', flexWrap: 'wrap' }}>
            {Object.entries(RISK_COLORS).map(([level, color]) => (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
