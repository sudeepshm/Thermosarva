import { Utensils, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

const EXPOSURE_CONFIG = {
  LOW_ENVIRONMENTAL_EXPOSURE:       { color: 'var(--status-ok)',       bg: 'var(--status-ok-dim)',       label: 'Low Exposure',       tagClass: 'tag-green' },
  ELEVATED_ENVIRONMENTAL_EXPOSURE:  { color: 'var(--status-warning)',  bg: 'var(--status-warning-dim)',  label: 'Elevated Exposure',  tagClass: 'tag-yellow' },
  HIGH_ENVIRONMENTAL_EXPOSURE:      { color: 'var(--status-critical)', bg: 'var(--status-critical-dim)', label: 'High Exposure',      tagClass: 'tag-red' },
};

export default function FoodSafetyGuard() {
  const { dashboardData, loading, error } = useApp();
  const data = dashboardData?.safety?.food ?? {};

  const category = data.environmental_exposure_category ?? 'LOW_ENVIRONMENTAL_EXPOSURE';
  const cfg = EXPOSURE_CONFIG[category] ?? EXPOSURE_CONFIG.LOW_ENVIRONMENTAL_EXPOSURE;
  const ambientTemp = data.ambient_temperature_c;
  const solarExposure = data.solar_exposure ?? '--';
  const ghi = data.ghi_wm2;
  const duration = data.operating_duration_hours;
  const recs = data.recommendations ?? [];

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
              <Utensils size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h1 className="page-title">Food Safety Guard</h1>
              <p className="page-desc">
                Environmental food handling context based on ambient conditions. Not food-temperature monitoring — this is environmental exposure assessment.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Environmental Conditions</span>
            <span className="dep-arrow">+</span>
            <span className="dep-step">Operating Duration</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Food Safety Guard</span>
          </div>
        </div>

        {/* Status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: `linear-gradient(90deg, ${cfg.bg}, transparent)`,
          border: `1px solid ${cfg.color}44`,
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px', marginBottom: 20,
        }}>
          <AlertTriangle size={20} color={cfg.color} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Environmental Exposure: {cfg.label}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Ambient {ambientTemp != null ? `${Math.round(ambientTemp)}°C` : '--'} · Solar: {solarExposure}
            </div>
          </div>
          <span className={`tag ${cfg.tagClass}`} style={{ marginLeft: 'auto' }}>{cfg.label}</span>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Ambient Temp</span>
            <span className="metric-value" style={{ color: cfg.color }}>{ambientTemp != null ? `${Math.round(ambientTemp)}°C` : '--'}</span>
            <span className="metric-sub">External conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Solar Exposure</span>
            <span className="metric-value" style={{ fontSize: '1rem' }}>{solarExposure}</span>
            <span className="metric-sub">{ghi != null ? `${Math.round(ghi)} W/m²` : '--'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Exposure Category</span>
            <span className="metric-value" style={{ fontSize: '0.9rem', color: cfg.color }}>{category.replace(/_/g, ' ')}</span>
            <span className="metric-sub">Environmental classification</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Operating Duration</span>
            <span className="metric-value">{duration != null ? `${duration}h` : '--'}</span>
            <span className="metric-sub">Planned session</span>
          </div>
        </div>

        <div className="two-col">
          {/* Recommendations */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title"><ShieldCheck size={14} className="panel-title-icon" /> Food Handling Recommendations</span>
            </div>
            <div className="panel-body">
              <div className="safety-list">
                {recs.length > 0 ? recs.map((rec, i) => (
                  <div key={i} className={`safety-row status-${category.includes('HIGH') ? 'critical' : category.includes('ELEVATED') ? 'warning' : 'ok'}`}>
                    <div className="safety-dot" />
                    <span className="safety-label">{rec}</span>
                  </div>
                )) : (
                  <div className="safety-row status-ok">
                    <div className="safety-dot" />
                    <span className="safety-label">Environmental conditions are within acceptable operating range.</span>
                  </div>
                )}
              </div>

              {data.disclaimer && (
                <p style={{ marginTop: 16, fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  ⚠ {data.disclaimer}
                </p>
              )}
            </div>
          </div>

          {/* Key Rules */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Food Safety Key Rules</span>
            </div>
            <div className="panel-body">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                • Hot foods must stay above <strong style={{ color: 'var(--text-primary)' }}>60°C</strong><br />
                • Cold foods must stay below <strong style={{ color: 'var(--text-primary)' }}>5°C</strong><br />
                • Never leave ready-to-eat food for more than <strong style={{ color: 'var(--text-primary)' }}>2 hours</strong> in the danger zone<br />
                • Discard if unsure — do not risk customer health
              </div>

              <div className="divider" />

              <p className="section-title">Temperature Danger Zone</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 24, borderRadius: 8, overflow: 'hidden', maxWidth: 400, marginTop: 8 }}>
                <div style={{ flex: 1, height: '100%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>Safe Cold (&lt;5°C)</div>
                <div style={{ flex: 3, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>⚠ DANGER ZONE (5–60°C)</div>
                <div style={{ flex: 1, height: '100%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>Safe Hot (&gt;60°C)</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <span className="tag tag-teal">Source: {data.data_source ?? 'Stub'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
