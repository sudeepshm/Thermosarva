import { Building2 } from 'lucide-react';
import { urbanHeatData } from '../../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#f97316', '#fbbf24', '#ef4444', '#a855f7'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{d.name}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: d.payload.fill }} />Contribution: {d.value}%</div>
    </div>
  );
};

export default function UrbanHeatInsights() {
  const pieData = urbanHeatData.factors.map((f, i) => ({
    name: f.label, value: f.contribution, fill: COLORS[i]
  }));

  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(168,85,247,0.12)' }}>
            <Building2 size={24} color="#a855f7" />
          </div>
          <div>
            <h1 className="page-title">Urban Heat Insights</h1>
            <p className="page-desc">
              Understand why your location experiences elevated thermal conditions — surface materials, vegetation, traffic density, and building density.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Local Heat Map</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Urban Heat Insights</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Location Comparison</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Environmental Risk Center</span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Surface Temperature</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>52°C</span>
          <span className="metric-sub">Pavement / concrete</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Air Temperature</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>41°C</span>
          <span className="metric-sub">At 1.5m height</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Green Coverage</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>12%</span>
          <span className="metric-sub">Very low — city average 35%</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Heat Island Intensity</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>High</span>
          <span className="metric-sub">+9°C above green baseline</span>
        </div>
      </div>

      <div className="two-col">
        {/* Pie Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Heat Island Contribution Factors</span>
          </div>
          <div className="panel-body">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            {urbanHeatData.factors.map((f, i) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{f.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: COLORS[i] }}>{f.contribution}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Factors Detail */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Factor Analysis</span>
          </div>
          <div className="panel-body">
            {urbanHeatData.factors.map((f, i) => (
              <div key={f.label} className="factor-row">
                <div>
                  <div className="factor-label" style={{ color: COLORS[i] }}>{f.label}</div>
                  <div className="factor-impact">{f.impact}</div>
                </div>
                <div>
                  <div className="progress-bar" style={{ width: 120 }}>
                    <div className="progress-fill" style={{ width: `${f.contribution * 2.5}%`, background: COLORS[i] }} />
                  </div>
                </div>
                <div className="factor-pct">{f.contribution}%</div>
              </div>
            ))}

            <div className="divider" />

            {/* Temperature comparison */}
            <p className="section-title">Area Temperature Comparison</p>
            {urbanHeatData.comparisonAreas.map(area => (
              <div key={area.name} className="area-temp-row">
                <div style={{ flex: 1 }}>
                  <div className="area-temp-name">{area.name}</div>
                  <div className="area-temp-type">{area.type}</div>
                </div>
                <span className="area-temp-val" style={{
                  color: area.temp >= 40 ? 'var(--status-critical)' : area.temp >= 36 ? 'var(--status-warning)' : 'var(--status-ok)'
                }}>
                  {area.temp}°C
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
