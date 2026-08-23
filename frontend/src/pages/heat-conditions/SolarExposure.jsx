import { SunMedium } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

export default function SolarExposure() {
  const { dashboardData, loading, error } = useApp();
  const solarRaw = dashboardData?.thermal?.solar;
  const solar = solarRaw?.solar ?? {};
  const ghi = solar?.ghi_wm2;
  const dni = solar?.dni_wm2;
  const dhi = solar?.dhi_wm2;
  const uvIndex = solar?.uv_index;
  const exposure = solar?.exposure ?? '--';

  const exposureColor = { LOW: 'var(--status-ok)', MODERATE: 'var(--brand-amber)', HIGH: 'var(--status-warning)', EXTREME: 'var(--status-critical)' };

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <SunMedium size={24} color="var(--brand-amber)" />
            </div>
            <div>
              <h1 className="page-title">Solar Exposure Map</h1>
              <p className="page-desc">
                Solar radiation intensity and UV index for the current time. Feeds into operating window planning and cold storage assessment.
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
            <span className="metric-label">GHI (Global)</span>
            <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>{ghi != null ? Math.round(ghi) : '--'}</span>
            <span className="metric-sub">W/m²</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">DNI (Direct)</span>
            <span className="metric-value">{dni != null ? Math.round(dni) : '--'}</span>
            <span className="metric-sub">W/m²</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">DHI (Diffuse)</span>
            <span className="metric-value">{dhi != null ? Math.round(dhi) : '--'}</span>
            <span className="metric-sub">W/m²</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">UV Index</span>
            <span className="metric-value" style={{ color: uvIndex >= 8 ? 'var(--status-critical)' : uvIndex >= 6 ? 'var(--status-warning)' : 'var(--status-ok)' }}>
              {uvIndex != null ? uvIndex : '--'}
            </span>
            <span className="metric-sub">{uvIndex >= 11 ? 'Extreme' : uvIndex >= 8 ? 'Very High' : uvIndex >= 6 ? 'High' : uvIndex >= 3 ? 'Moderate' : 'Low'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Exposure Level</span>
            <span className="metric-value" style={{ fontSize: '1rem', color: exposureColor[exposure] || 'var(--text-primary)' }}>{exposure}</span>
            <span className="metric-sub">Classification</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Source</span>
            <span className="metric-value" style={{ fontSize: '0.85rem' }}>{solarRaw?.data_source ?? 'Stub'}</span>
            <span className="metric-sub">{solarRaw?.date ?? ''}</span>
          </div>
        </div>

        {/* Solar intensity visual */}
        <div className="panel mb-20">
          <div className="panel-header">
            <span className="panel-title"><SunMedium size={14} className="panel-title-icon" /> Solar Radiation Breakdown</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Global Horizontal (GHI)', value: ghi, max: 1000, color: '#fbbf24', desc: 'Total solar radiation on horizontal surface' },
                { label: 'Direct Normal (DNI)', value: dni, max: 900, color: '#f97316', desc: 'Direct beam radiation' },
                { label: 'Diffuse Horizontal (DHI)', value: dhi, max: 400, color: '#60a5fa', desc: 'Scattered sky radiation' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 700 }}>{item.value != null ? `${Math.round(item.value)} W/m²` : '--'}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${item.value != null ? Math.min(100, (item.value / item.max) * 100) : 0}%`, background: item.color }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
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
    </DataGuard>
  );
}
