import { SunMedium } from 'lucide-react';
import { solarExposureData } from '../../data/mockData';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {p.name}: {p.value}{p.name === 'Radiation' ? ' W/m²' : ''}
        </div>
      ))}
    </div>
  );
};

export default function SolarExposure() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <SunMedium size={24} color="var(--brand-amber)" />
          </div>
          <div>
            <h1 className="page-title">Solar Exposure Map</h1>
            <p className="page-desc">
              Hourly solar radiation intensity and UV index. Feeds into operating window planning and cold storage risk assessment.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step current">Solar Exposure</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Thermal Conditions</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Operating Window</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Cold Storage Protection</span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Peak Radiation</span>
          <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>850</span>
          <span className="metric-sub">W/m² at 12 PM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Peak UV Index</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>10</span>
          <span className="metric-sub">Very High — 12 PM – 1 PM</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Safe UV Window</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>6–8 AM</span>
          <span className="metric-sub">UV Index ≤ 3</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Daily Solar Load</span>
          <span className="metric-value" style={{ fontSize: '1.3rem' }}>6.1 kWh</span>
          <span className="metric-sub">Per m² surface</span>
        </div>
      </div>

      {/* Chart */}
      <div className="panel mb-20">
        <div className="panel-header">
          <span className="panel-title"><SunMedium size={14} className="panel-title-icon" /> Solar Radiation & UV Index (12-Hour)</span>
        </div>
        <div className="panel-body">
          <div className="chart-container-tall">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={solarExposureData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit=" W/m²" width={65} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 12]} unit=" UV" />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="radiation" name="Radiation" stroke="#fbbf24" strokeWidth={2} fill="url(#gradSolar)" />
                <Line yAxisId="right" type="monotone" dataKey="uvIndex" name="UV Index" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* UV Risk Table */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">UV Index Risk Guide</span>
        </div>
        <div className="panel-body no-pad">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>UV Index</th><th>Level</th><th>Risk</th><th>Protection Required</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '0–2', level: 'Low', risk: 'Minimal', protection: 'Sunscreen optional', color: '#22c55e' },
                { range: '3–5', level: 'Moderate', risk: 'Low', protection: 'SPF 30+ recommended', color: '#84cc16' },
                { range: '6–7', level: 'High', risk: 'Moderate', protection: 'SPF 50+, shade', color: '#f59e0b' },
                { range: '8–10', level: 'Very High', risk: 'High', protection: 'Limit exposure, full cover', color: '#f97316' },
                { range: '11+', level: 'Extreme', risk: 'Critical', protection: 'Avoid direct exposure', color: '#ef4444' },
              ].map(row => (
                <tr key={row.range}>
                  <td><strong style={{ color: row.color }}>{row.range}</strong></td>
                  <td><span className="tag" style={{ background: `${row.color}22`, color: row.color, border: `1px solid ${row.color}44` }}>{row.level}</span></td>
                  <td>{row.risk}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.protection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
