import { useState } from 'react';
import { Warehouse, CheckCircle, XCircle, Zap, Droplets, MapPin, Trees, Users } from 'lucide-react';
import { sitePlanningData } from '../../data/mockData';

const STATUS_CONFIG = {
  best:        { color: 'var(--brand-primary)',    bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'Best Choice' },
  recommended: { color: 'var(--status-ok)',        bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  label: 'Recommended' },
  caution:     { color: 'var(--status-warning)',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Caution' },
  critical:    { color: 'var(--status-critical)',  bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  label: 'High Risk' },
};

const PERMIT_COLORS = {
  Available:   'var(--status-ok)',
  Waitlist:    'var(--status-warning)',
  Restricted:  'var(--status-critical)',
};

function ShadeBar({ score }) {
  const color = score >= 70 ? 'var(--status-ok)' : score >= 40 ? 'var(--status-warning)' : 'var(--status-critical)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width var(--transition-slow)' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 700, fontFamily: 'Outfit', minWidth: 24 }}>{score}</span>
    </div>
  );
}

export default function SitePlanning() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-scroll">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <Warehouse size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">Site Planning</h1>
            <p className="page-desc">
              Evaluate fixed parking sites and long-term locations based on shade, infrastructure, permits, and footfall potential.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Asset-Level Profiles</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Site Planning</span>
        </div>
      </div>

      {/* Summary */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Available Sites</span>
          <span className="metric-value">{sitePlanningData.length}</span>
          <span className="metric-sub">In your operating area</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Footfall</span>
          <span className="metric-value" style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }}>Indiranagar</span>
          <span className="metric-sub">Score 94 — Permit available</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Best Shade</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)', fontSize: '1.1rem' }}>Tech Park</span>
          <span className="metric-sub">Shade score 78 — Covered</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Lowest Cost</span>
          <span className="metric-value" style={{ color: 'var(--brand-teal)', fontSize: '1.1rem' }}>Rs 200</span>
          <span className="metric-sub">Majestic — restricted permit</span>
        </div>
      </div>

      <div className="two-col">
        {/* Left: Sites list */}
        <div>
          <p className="section-title">Fixed Sites</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sitePlanningData.map(site => {
              const cfg = STATUS_CONFIG[site.status];
              const isSelected = selected?.id === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => setSelected(isSelected ? null : site)}
                  style={{
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? cfg.border : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 2 }}>{site.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={11} /> {site.location} · {site.type}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: 99,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      color: cfg.color,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Shade bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Shade Score</div>
                    <ShadeBar score={site.shadeScore} />
                  </div>

                  {/* Infrastructure */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: site.powerAvailable ? 'var(--status-ok)' : 'var(--text-muted)' }}>
                      <Zap size={11} /> Power {site.powerAvailable ? '✓' : '✗'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: site.waterAccess ? 'var(--status-ok)' : 'var(--text-muted)' }}>
                      <Droplets size={11} /> Water {site.waterAccess ? '✓' : '✗'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Users size={11} /> {site.capacity}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: PERMIT_COLORS[site.permitStatus] }}>
                      {site.permitStatus}
                    </div>
                  </div>

                  {/* Rent */}
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily Rent:</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-amber)' }}>{site.dailyRent}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail */}
        <div>
          <p className="section-title">Site Profile</p>
          {selected ? (
            <div className="panel" style={{ position: 'sticky', top: 0 }}>
              <div className="panel-header">
                <span className="panel-title">
                  <Warehouse size={14} className="panel-title-icon" />
                  {selected.name}
                </span>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Location */}
                <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{selected.location} · {selected.type}</span>
                </div>

                {/* Shade bar */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Shade Score — {selected.shadeRating}</div>
                  <ShadeBar score={selected.shadeScore} />
                </div>

                {/* Infrastructure grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Road Access',       value: selected.roadAccess, icon: MapPin },
                    { label: 'Capacity',          value: selected.capacity,   icon: Users },
                    { label: 'Nearby Amenities',  value: `${selected.nearbyAmenities} POIs`, icon: Trees },
                    { label: 'Footfall Score',    value: selected.footfallScore, icon: Users },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Utilities */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                    background: selected.powerAvailable ? 'rgba(34,197,94,0.10)' : 'var(--bg-elevated)',
                    border: `1px solid ${selected.powerAvailable ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle)'}`,
                  }}>
                    <Zap size={16} color={selected.powerAvailable ? 'var(--status-ok)' : 'var(--text-muted)'} />
                    <div style={{ fontSize: '0.7rem', marginTop: 4, color: selected.powerAvailable ? 'var(--status-ok)' : 'var(--text-muted)' }}>
                      {selected.powerAvailable ? 'Power Available' : 'No Power Hookup'}
                    </div>
                  </div>
                  <div style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                    background: selected.waterAccess ? 'rgba(34,197,94,0.10)' : 'var(--bg-elevated)',
                    border: `1px solid ${selected.waterAccess ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle)'}`,
                  }}>
                    <Droplets size={16} color={selected.waterAccess ? 'var(--status-ok)' : 'var(--text-muted)'} />
                    <div style={{ fontSize: '0.7rem', marginTop: 4, color: selected.waterAccess ? 'var(--status-ok)' : 'var(--text-muted)' }}>
                      {selected.waterAccess ? 'Water Access' : 'No Water Access'}
                    </div>
                  </div>
                </div>

                {/* Permit + rent */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Permit Status</div>
                    <div style={{ fontWeight: 700, color: PERMIT_COLORS[selected.permitStatus] }}>{selected.permitStatus}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily Rent</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-amber)' }}>{selected.dailyRent}</div>
                  </div>
                </div>

                {/* Notes */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Site Notes</div>
                  {selected.notes}
                </div>

                <button style={{
                  width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-primary-dim)', border: '1px solid var(--border-brand)',
                  color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
                }}>
                  Add to Shortlist
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)',
            }}>
              <Warehouse size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>Select a site to view full infrastructure profile and permit details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
