import { HardHat, Droplets, Wind, Thermometer } from 'lucide-react';
import { crewSafetyData } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RISK_COLORS = { Low: '#22c55e', Moderate: '#84cc16', Elevated: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Risk Score: {payload[0]?.value}</div>
    </div>
  );
};

export default function CrewHeatSafety() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <HardHat size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">Crew Heat Safety</h1>
            <p className="page-desc">
              Monitor crew exposure levels, hydration alerts, rest schedules, and heat illness risk in real time.
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
        background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
      }}>
        <HardHat size={24} color="var(--status-warning)" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Crew Risk: Elevated</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Heat index {crewSafetyData.heatIndex}°C · Exposure {crewSafetyData.exposure} · Next break in {crewSafetyData.nextBreak}
          </div>
        </div>
        {crewSafetyData.hydrationAlert && (
          <span className="tag tag-yellow" style={{ marginLeft: 'auto' }}>
            <Droplets size={10} /> Hydration Alert
          </span>
        )}
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Heat Index</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{crewSafetyData.heatIndex}°C</span>
          <span className="metric-sub">Elevated risk zone</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Exposure Duration</span>
          <span className="metric-value" style={{ fontSize: '1.2rem' }}>{crewSafetyData.exposure}</span>
          <span className="metric-sub">Continuous outdoor time</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Next Mandatory Break</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)', fontSize: '1.2rem' }}>{crewSafetyData.nextBreak}</span>
          <span className="metric-sub">Action required soon</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Water Intake Rate</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>250ml</span>
          <span className="metric-sub">Every 20 minutes</span>
        </div>
      </div>

      <div className="two-col">
        {/* Hourly Risk Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Thermometer size={14} className="panel-title-icon" /> Hourly Crew Risk Score</span>
          </div>
          <div className="panel-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crewSafetyData.hourlyExposure} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="risk" name="Risk Score" radius={[3, 3, 0, 0]}>
                    {crewSafetyData.hourlyExposure.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.risk >= 85 ? '#ef4444' : d.risk >= 65 ? '#f97316' : d.risk >= 45 ? '#f59e0b' : '#22c55e'}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Safety Guidelines — Current Conditions</span>
          </div>
          <div className="panel-body">
            <div className="safety-list">
              {crewSafetyData.guidelines.map(g => (
                <div key={g.label} className={`safety-row status-${g.status}`}>
                  <div className="safety-dot" />
                  <span className="safety-label">{g.label}</span>
                  <span className="safety-value">{g.value}</span>
                </div>
              ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}
