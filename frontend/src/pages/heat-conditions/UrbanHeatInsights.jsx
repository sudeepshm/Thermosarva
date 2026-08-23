import { Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#f97316', '#fbbf24', '#22c55e', '#a855f7'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{d.name}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: d.payload.fill }} />Value: {d.value}%</div>
    </div>
  );
};

export default function UrbanHeatInsights() {
  const { dashboardData, loading, error } = useApp();
  const raw = dashboardData?.thermal?.urban_heat;
  const urbanHeat = raw?.urban_heat ?? {};

  const uhi = urbanHeat.uhi_intensity ?? '--';
  const builtPct = urbanHeat.built_environment_pct ?? 0;
  const vegPct = urbanHeat.vegetation_cover_pct ?? 0;
  const ambientTemp = urbanHeat.ambient_temperature_c;
  const interp = urbanHeat.interpretation ?? '';

  const pieData = [
    { name: 'Built Environment', value: Math.round(builtPct), fill: COLORS[0] },
    { name: 'Vegetation Cover', value: Math.round(vegPct), fill: COLORS[2] },
    { name: 'Other / Open', value: Math.max(0, 100 - Math.round(builtPct) - Math.round(vegPct)), fill: COLORS[1] },
  ].filter(d => d.value > 0);

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(168,85,247,0.12)' }}>
              <Building2 size={24} color="#a855f7" />
            </div>
            <div>
              <h1 className="page-title">Urban Heat Insights</h1>
              <p className="page-desc">
                Understand urban heat island effects at your location — built density, vegetation cover, and their impact on thermal conditions.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Local Heat Map</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Urban Heat Insights</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Environmental Risk Center</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Ambient Temperature</span>
            <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{ambientTemp != null ? `${Math.round(ambientTemp)}°C` : '--'}</span>
            <span className="metric-sub">Current conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">UHI Intensity</span>
            <span className="metric-value" style={{ fontSize: '1rem', color: uhi === 'HIGH' ? 'var(--status-critical)' : uhi === 'MODERATE' ? 'var(--status-warning)' : 'var(--status-ok)' }}>{uhi}</span>
            <span className="metric-sub">Urban heat island effect</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Built Environment</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{Math.round(builtPct)}%</span>
            <span className="metric-sub">Concrete/asphalt coverage</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Vegetation Cover</span>
            <span className="metric-value" style={{ color: 'var(--status-ok)' }}>{Math.round(vegPct)}%</span>
            <span className="metric-sub">Green area coverage</span>
          </div>
        </div>

        <div className="two-col">
          {/* Pie Chart */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Land Cover Composition</span>
            </div>
            <div className="panel-body">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {pieData.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: f.fill, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{f.name}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: f.fill }}>{f.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Assessment & Interpretation</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: uhi === 'HIGH' ? 'var(--status-critical-dim)' : uhi === 'MODERATE' ? 'var(--status-warning-dim)' : 'var(--status-ok-dim)', border: `1px solid ${uhi === 'HIGH' ? 'rgba(239,68,68,0.3)' : uhi === 'MODERATE' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>Urban Heat Island: {uhi}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{interp || 'Assessment based on satellite and environmental data.'}</div>
                </div>

                {[
                  { label: 'Built Environment', pct: builtPct, color: COLORS[0] },
                  { label: 'Vegetation Cover', pct: vegPct, color: COLORS[2] },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: 700 }}>{Math.round(item.pct)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <span className="tag tag-teal">Source: {raw?.data_source ?? 'Stub'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
