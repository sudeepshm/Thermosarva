import { GitCompareArrows, Thermometer, Trees, SunMedium, ChartNoAxesCombined, Star } from 'lucide-react';
import { candidateLocations } from '../../data/mockData';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const ATTRS = [
  { key: 'score', label: 'Overall Score' },
  { key: 'businessPotential', label: 'Business Potential' },
  { key: 'nearbyPOI', label: 'Nearby POIs', max: 35 },
];

function heatColor(val) {
  if (val >= 43) return 'var(--status-critical)';
  if (val >= 38) return 'var(--status-warning)';
  return 'var(--status-ok)';
}

const RADAR_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ef4444'];

const radarData = [
  { metric: 'Business', ...Object.fromEntries(candidateLocations.map(l => [l.id, l.businessPotential])) },
  { metric: 'Score', ...Object.fromEntries(candidateLocations.map(l => [l.id, l.score])) },
  { metric: 'POIs', ...Object.fromEntries(candidateLocations.map(l => [l.id, (l.nearbyPOI / 35) * 100])) },
  { metric: 'Shade', ...Object.fromEntries(candidateLocations.map(l => [l.id, l.shade === 'High' ? 90 : l.shade === 'Moderate' ? 60 : l.shade === 'Low' ? 30 : 10])) },
  { metric: 'Heat Safety', ...Object.fromEntries(candidateLocations.map(l => [l.id, Math.max(0, 100 - ((l.heatIndex - 30) / 15) * 100)])) },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{payload[0]?.payload?.metric}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {candidateLocations.find(l => l.id === p.dataKey)?.name?.split(',')[0]}: {Math.round(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function LocationComparison() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <GitCompareArrows size={24} color="var(--brand-teal)" />
          </div>
          <div>
            <h1 className="page-title">Location Comparison</h1>
            <p className="page-desc">
              Side-by-side comparison of all candidate locations across business, thermal, and safety dimensions.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Location Planner</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Heat Conditions</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Location Comparison</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Best Location Choice</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="panel mb-20">
        <div className="panel-header">
          <span className="panel-title">Multi-Dimension Radar Comparison</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {candidateLocations.map((loc, i) => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: RADAR_COLORS[i] }} />
                {loc.name.split(',')[0]}
              </div>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="chart-container-tall">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                {candidateLocations.map((loc, i) => (
                  <Radar
                    key={loc.id}
                    name={loc.name}
                    dataKey={loc.id}
                    stroke={RADAR_COLORS[i]}
                    fill={RADAR_COLORS[i]}
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title"><Star size={14} className="panel-title-icon" /> Detailed Comparison</span>
        </div>
        <div className="panel-body no-pad">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Attribute</th>
                {candidateLocations.map(loc => (
                  <th key={loc.id}>{loc.name.split(',')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Overall Score', render: l => <strong style={{ color: 'var(--brand-primary)' }}>{l.score}</strong> },
                { label: 'Heat Index', render: l => <span style={{ color: heatColor(l.heatIndex), fontWeight: 700 }}>{l.heatIndex}°C</span> },
                { label: 'Shade Coverage', render: l => l.shade },
                { label: 'Solar Exposure', render: l => l.solarExposure },
                { label: 'Business Potential', render: l => <strong>{l.businessPotential}</strong> },
                { label: 'Nearby POIs', render: l => l.nearbyPOI },
                { label: 'Urban Heat', render: l => l.urbanHeat },
                {
                  label: 'Recommendation',
                  render: l => (
                    <span className={`tag tag-${l.status === 'best' ? 'orange' : l.status === 'critical' ? 'red' : l.status === 'caution' ? 'yellow' : 'green'}`}>
                      {l.status === 'best' ? '★ Best Choice' : l.status === 'critical' ? 'Avoid Peak' : l.status === 'caution' ? 'With Caution' : 'Recommended'}
                    </span>
                  )
                },
              ].map(row => (
                <tr key={row.label}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</td>
                  {candidateLocations.map(loc => (
                    <td key={loc.id}>{row.render(loc)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Pick Banner */}
      <div style={{
        background: 'linear-gradient(120deg, rgba(249,115,22,0.12), rgba(251,191,36,0.08))',
        border: '1px solid rgba(249,115,22,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginTop: 8,
      }}>
        <Star size={28} color="var(--brand-amber)" fill="var(--brand-amber)" />
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            Best Location Choice: University Zone, Indiranagar
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Score 93 · Heat Index 33°C · High Shade · Business Potential 94 · 18 nearby POIs
          </div>
        </div>
      </div>
    </div>
  );
}
