import { Refrigerator, Thermometer, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

const PRESSURE_CONFIG = {
  NORMAL_EXTERNAL_LOAD:     { color: 'var(--status-ok)',       bg: 'var(--status-ok-dim)',       label: 'Normal Load',         tagClass: 'tag-green' },
  ELEVATED_COOLING_DEMAND:  { color: 'var(--status-warning)',  bg: 'var(--status-warning-dim)',  label: 'Elevated Demand',     tagClass: 'tag-yellow' },
  HIGH_THERMAL_PRESSURE:    { color: 'var(--status-critical)', bg: 'var(--status-critical-dim)', label: 'High Pressure',       tagClass: 'tag-red' },
};

export default function ColdStorageProtection() {
  const { dashboardData, loading, error } = useApp();
  const data = dashboardData?.safety?.cold_storage ?? {};

  const pressure     = data.external_thermal_pressure ?? 'NORMAL_EXTERNAL_LOAD';
  const cfg          = PRESSURE_CONFIG[pressure] ?? PRESSURE_CONFIG.NORMAL_EXTERNAL_LOAD;
  const externalTemp = data.external_temperature_c;
  const effectiveTemp= data.effective_temperature_load_c;
  const ghi          = data.ghi_wm2;
  const solarLoad    = data.solar_load ?? '--';
  const duration     = data.operating_duration_hours;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Refrigerator size={24} color="var(--status-info)" />
            </div>
            <div>
              <h1 className="page-title">Cold Storage Protection</h1>
              <p className="page-desc">
                External thermal pressure assessment for cold storage equipment. Based on ambient conditions — not internal sensor data.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">External Thermal Conditions</span>
            <span className="dep-arrow">+</span>
            <span className="dep-step">Solar Exposure</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Cold Storage Protection</span>
          </div>
        </div>

        {/* Status Banner */}
        <div style={{
          background: `linear-gradient(90deg, ${cfg.bg}, transparent)`,
          border: `1px solid ${cfg.color}44`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 20,
        }}>
          <Refrigerator size={24} color={cfg.color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              External Thermal Pressure: {cfg.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              External temp {externalTemp != null ? `${Math.round(externalTemp)}°C` : '--'} · Solar Load: {solarLoad}
            </div>
          </div>
          <span className={`tag ${cfg.tagClass}`}>{cfg.label}</span>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">External Temp</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{externalTemp != null ? `${Math.round(externalTemp)}°C` : '--'}</span>
            <span className="metric-sub">Ambient outside</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Effective Load Temp</span>
            <span className="metric-value" style={{ color: cfg.color }}>{effectiveTemp != null ? `${effectiveTemp}°C` : '--'}</span>
            <span className="metric-sub">With shade adjustment</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Solar Irradiance</span>
            <span className="metric-value">{ghi != null ? `${Math.round(ghi)} W/m²` : '--'}</span>
            <span className="metric-sub">Global horizontal</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Operating Duration</span>
            <span className="metric-value">{duration != null ? `${duration}h` : '--'}</span>
            <span className="metric-sub">Planned session</span>
          </div>
        </div>

        {/* Disclaimer + Recommendations */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><ShieldCheck size={14} className="panel-title-icon" /> Assessment Details</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: `1px solid ${cfg.color}33` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Pressure Category</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{pressure.replace(/_/g, ' ')}</div>
                </div>
                <span className={`tag ${cfg.tagClass}`} style={{ marginLeft: 'auto' }}>{cfg.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-amber)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Solar Load Classification: {solarLoad}</div>
              </div>
            </div>
            {data.disclaimer && (
              <p style={{ marginTop: 16, fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                ⚠ {data.disclaimer}
              </p>
            )}
            <div style={{ marginTop: 12 }}>
              <span className="tag tag-teal">Source: {data.data_source ?? 'Stub'}</span>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
