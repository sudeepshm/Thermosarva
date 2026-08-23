import { GitCompareArrows, Thermometer, Trees, SunMedium, ChartNoAxesCombined } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{payload[0]?.payload?.subject}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Score: {payload[0]?.value}</div>
    </div>
  );
};

export default function LocationComparison() {
  const { dashboardData, loading, error, location } = useApp();
  const current = dashboardData?.thermal?.current ?? {};
  const shade = dashboardData?.thermal?.shade?.shade_assessment ?? {};
  const urbanHeat = dashboardData?.thermal?.urban_heat?.urban_heat ?? {};
  const safety = dashboardData?.safety ?? {};

  const hi = current?.heat_index_c ?? current?.temperature_c ?? 0;
  const shadeScore = shade?.shade_score ?? 0;
  const nearbyPois = Object.values(dashboardData?.location_context?.nearby?.categories ?? {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0);
  const bpScore = dashboardData?.location_context?.business?.business_potential_score ?? 0;

  // Build radar data from real metrics
  const radarData = [
    { subject: 'Heat Safety', value: Math.max(0, 100 - Math.round(hi * 2.2)) },
    { subject: 'Shade', value: shadeScore },
    { subject: 'Business', value: bpScore },
    { subject: 'POIs', value: Math.min(100, nearbyPois * 5) },
    { subject: 'Air Quality', value: Math.max(0, 100 - (current?.aqi ?? 0) / 2) },
  ];

  const overallScore = Math.round(radarData.reduce((s, d) => s + d.value, 0) / radarData.length);
  const statusColor = overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <GitCompareArrows size={24} color="#6366f1" />
            </div>
            <div>
              <h1 className="page-title">Location Assessment</h1>
              <p className="page-desc">
                Multi-dimensional location analysis for {location.city || 'selected location'}. Evaluate heat safety, shade, business potential, and environmental quality.
              </p>
            </div>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Overall Score</span>
            <span className="metric-value" style={{ color: statusColor }}>{overallScore}</span>
            <span className="metric-sub">{location.city}, {location.state}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Heat Index</span>
            <span className="metric-value" style={{ color: hi > 38 ? 'var(--status-critical)' : 'var(--status-warning)' }}>{hi ? `${Math.round(hi)}°C` : '--'}</span>
            <span className="metric-sub">Current conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Shade Score</span>
            <span className="metric-value" style={{ color: shadeScore > 60 ? 'var(--status-ok)' : 'var(--status-warning)' }}>{shadeScore || '--'}</span>
            <span className="metric-sub">{shade?.shade_quality || '--'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Nearby POIs</span>
            <span className="metric-value">{nearbyPois}</span>
            <span className="metric-sub">Demand centers</span>
          </div>
        </div>

        <div className="two-col">
          {/* Radar */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title"><ChartNoAxesCombined size={14} className="panel-title-icon" /> Location Profile — {location.city || 'Current'}</span>
            </div>
            <div className="panel-body">
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dimension breakdown */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Dimension Scores</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {radarData.map((dim, i) => {
                  const barColor = dim.value >= 70 ? '#22c55e' : dim.value >= 40 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={dim.subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dim.subject}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: barColor }}>{dim.value}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 8 }}>
                        <div className="progress-fill" style={{ width: `${dim.value}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="divider" />

              <p className="section-title">Key Factors</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <Thermometer size={14} />, label: 'Heat Safety', detail: `Heat index ${hi ? Math.round(hi) + '°C' : '--'} · Crew risk: ${safety.crew?.category ?? 'NORMAL'}` },
                  { icon: <Trees size={14} />, label: 'Shade Coverage', detail: `Shade score: ${shadeScore} · Tree canopy: ${shade?.tree_canopy_pct != null ? Math.round(shade.tree_canopy_pct) + '%' : '--'}` },
                  { icon: <SunMedium size={14} />, label: 'Solar Exposure', detail: `UHI Intensity: ${urbanHeat?.uhi_intensity ?? '--'} · Built: ${urbanHeat?.built_environment_pct != null ? Math.round(urbanHeat.built_environment_pct) + '%' : '--'}` },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
                    <div style={{ color: 'var(--brand-primary)', marginTop: 2 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
