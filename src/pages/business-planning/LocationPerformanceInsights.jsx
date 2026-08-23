import { ChartSpline, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function LocationPerformanceInsights() {
  const { dashboardData, loading, error, location } = useApp();
  const current = dashboardData?.thermal?.current ?? {};
  const hi = current?.heat_index_c ?? current?.temperature_c ?? 34;

  const cityName = location.city || 'Austin';

  const weekly = [
    { day: 'Mon', mainSite: 72, shadedHub: 68, streetFront: 60 },
    { day: 'Tue', mainSite: 78, shadedHub: 72, streetFront: 65 },
    { day: 'Wed', mainSite: 82, shadedHub: 75, streetFront: 70 },
    { day: 'Thu', mainSite: 88, shadedHub: 80, streetFront: 74 },
    { day: 'Fri', mainSite: 96, shadedHub: 88, streetFront: 82 },
    { day: 'Sat', mainSite: 94, shadedHub: 90, streetFront: 79 },
    { day: 'Sun', mainSite: 80, shadedHub: 84, streetFront: 71 },
  ];

  const topSlots = [
    { location: `${cityName} — Main Hub`, slot: 'Fri 8:00 – 10:30 AM', score: 96, avg: '$1,200' },
    { location: `${cityName} — Shaded Park`, slot: 'Sat 11:30 AM – 2:00 PM', score: 90, avg: '$980' },
    { location: `${cityName} — Commercial Strip`, slot: 'Thu 5:00 – 7:30 PM', score: 84, avg: '$820' },
  ];

  const heatImpact = [
    { range: '< 30°C', label: 'Comfortable', modifier: '+18%', color: 'var(--status-ok)' },
    { range: '30 – 35°C', label: 'Moderate', modifier: '--', color: 'var(--brand-amber)' },
    { range: '36 – 42°C', label: 'High Heat', modifier: '-32%', color: 'var(--status-warning)' },
    { range: '> 42°C', label: 'Extreme Heat', modifier: '-58%', color: 'var(--status-critical)' },
  ];

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
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
                Historical performance models and revenue sensitivities for {cityName} based on thermal conditions.
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
            <span className="metric-label">Primary Zone</span>
            <span className="metric-value" style={{ fontSize: '1rem', color: 'var(--brand-primary)' }}>{cityName}</span>
            <span className="metric-sub">Score 96 — Fri Morning</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Peak Slot Yield</span>
            <span className="metric-value" style={{ color: 'var(--brand-amber)', fontSize: '1.3rem' }}>$1,200</span>
            <span className="metric-sub">Friday morning average</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Heat Revenue Impact</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)', fontSize: '1.3rem' }}>-58%</span>
            <span className="metric-sub">When heat index &gt; 42°C</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Current Heat Index</span>
            <span className="metric-value" style={{ fontSize: '1.3rem', color: 'var(--status-ok)' }}>{Math.round(hi)}°C</span>
            <span className="metric-sub">Live conditions baseline</span>
          </div>
        </div>

        {/* Weekly performance chart */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <span className="panel-title">
              <ChartSpline size={14} className="panel-title-icon" />
              Weekly Performance Score by Location Zone
            </span>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: '#f97316', borderRadius: 2 }} /> Main Hub
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: '#2dd4bf', borderRadius: 2 }} /> Shaded Hub
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: '#fbbf24', borderRadius: 2 }} /> Street Front
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart-container-tall">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mainSite" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} />
                  <Line type="monotone" dataKey="shadedHub" stroke="#2dd4bf" strokeWidth={2.5} dot={{ r: 3, fill: '#2dd4bf' }} />
                  <Line type="monotone" dataKey="streetFront" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3, fill: '#fbbf24' }} />
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
                    <th>Location Zone</th>
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
                          color: slot.score >= 90 ? 'var(--status-ok)' : 'var(--status-warning)',
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
              <span className="panel-title">Heat vs Revenue Sensitivity</span>
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
    </DataGuard>
  );
}
