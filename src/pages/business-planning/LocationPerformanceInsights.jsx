import { ChartSpline, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { locationPerformanceData } from '../../data/mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const LOCATION_COLORS = {
  indiranagar:  '#f97316',
  whitefield:   '#2dd4bf',
  koramangala:  '#fbbf24',
  majestic:     '#94a3b8',
};

const LOCATION_LABELS = {
  indiranagar: 'Indiranagar',
  whitefield:  'Whitefield',
  koramangala: 'Koramangala',
  majestic:    'Majestic',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {LOCATION_LABELS[p.dataKey] || p.dataKey}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function LocationPerformanceInsights() {
  const { weekly, topSlots, heatImpact } = locationPerformanceData;

  return (
    <div className="page-scroll">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <ChartSpline size={24} color="var(--brand-teal)" />
          </div>
          <div>
            <h1 className="page-title">Location Performance Insights</h1>
            <p className="page-desc">
              Understand historical performance patterns across all candidate locations. Find your highest-yield time slots and see how heat affects revenue.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Thermal History</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Map Statistics</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Location Performance Insights</span>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Top Location</span>
          <span className="metric-value" style={{ fontSize: '1rem', color: 'var(--brand-primary)' }}>Indiranagar</span>
          <span className="metric-sub">Score 97 — Fri 8–10 AM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Revenue/Day</span>
          <span className="metric-value" style={{ color: 'var(--brand-amber)', fontSize: '1.3rem' }}>Rs 5,800</span>
          <span className="metric-sub">Indiranagar Friday average</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Heat Revenue Impact</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)', fontSize: '1.3rem' }}>-58%</span>
          <span className="metric-sub">When heat index above 44°C</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Day of Week</span>
          <span className="metric-value" style={{ fontSize: '1.3rem', color: 'var(--status-ok)' }}>Friday</span>
          <span className="metric-sub">Across all locations</span>
        </div>
      </div>

      {/* Weekly performance chart */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <span className="panel-title">
            <ChartSpline size={14} className="panel-title-icon" />
            Weekly Performance Score by Location
          </span>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
            {Object.entries(LOCATION_COLORS).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: color, borderRadius: 2 }} />
                {LOCATION_LABELS[key]}
              </div>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="chart-container-tall">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {Object.entries(LOCATION_COLORS).map(([key, color]) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Top time slots */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Top-Performing Time Slots</span>
          </div>
          <div className="panel-body no-pad">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Best Slot</th>
                  <th>Score</th>
                  <th>Avg Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSlots.map((slot, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{slot.location}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{slot.slot}</td>
                    <td>
                      <span style={{
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        color: slot.score >= 90 ? 'var(--status-ok)' : slot.score >= 75 ? 'var(--status-warning)' : 'var(--status-critical)',
                      }}>{slot.score}</span>
                    </td>
                    <td style={{ color: 'var(--brand-amber)', fontWeight: 600 }}>{slot.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heat impact on revenue */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Heat vs Revenue Impact</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {heatImpact.map((h, i) => {
              const Icon = h.modifier.startsWith('+') ? TrendingUp : h.modifier === '--' ? Minus : TrendingDown;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${h.color}33`,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: `${h.color}1a`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={h.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{h.range}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{h.label} operating conditions</div>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: h.color }}>{h.modifier}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
