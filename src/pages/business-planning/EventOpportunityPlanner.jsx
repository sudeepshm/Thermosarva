import { useState } from 'react';
import { CalendarDays, MapPin, Users, Thermometer, Wind, Trees, TrendingUp } from 'lucide-react';
import { eventOpportunityData } from '../../data/mockData';

const FORECAST_CONFIG = {
  good:    { color: 'var(--status-ok)',       bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  label: 'Good Conditions' },
  caution: { color: 'var(--status-warning)',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Caution' },
  avoid:   { color: 'var(--status-critical)', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  label: 'High Heat Risk' },
};

const OPP_COLORS = {
  'Very High': 'var(--status-ok)',
  'High':      'var(--brand-primary)',
  'Medium':    'var(--status-warning)',
  'Low':       'var(--status-critical)',
};

export default function EventOpportunityPlanner() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-scroll">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <CalendarDays size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">Event Opportunity Planner</h1>
            <p className="page-desc">
              Discover upcoming local events and evaluate each one against thermal conditions, footfall, and revenue potential before committing.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Thermal Forecast</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Event Data</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Event Opportunity Planner</span>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Upcoming Events</span>
          <span className="metric-value">{eventOpportunityData.length}</span>
          <span className="metric-sub">Next 30 days</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Recommended</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)' }}>2</span>
          <span className="metric-sub">Good thermal conditions</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Caution</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>1</span>
          <span className="metric-sub">Manage timing carefully</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avoid / High Risk</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>1</span>
          <span className="metric-sub">Peak heat during event</span>
        </div>
      </div>

      <div className="two-col">
        {/* Left: Events list */}
        <div>
          <p className="section-title">Upcoming Events</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eventOpportunityData.map(evt => {
              const forecast = FORECAST_CONFIG[evt.thermalForecast];
              const isSelected = selected?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelected(isSelected ? null : evt)}
                  style={{
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{evt.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={11} /> {evt.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {evt.location}</span>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: forecast.bg,
                      border: `1px solid ${forecast.border}`,
                      color: forecast.color,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}>
                      {forecast.label}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <Users size={12} />
                      <span>{evt.expectedFootfall.toLocaleString()} footfall</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <Thermometer size={12} />
                      <span>{evt.heatIndex}°C heat index</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <Wind size={12} />
                      <span>AQI {evt.aqi}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                      <Trees size={12} />
                      <span>Shade: {evt.shadeAvailable}</span>
                    </div>
                  </div>

                  {/* Revenue + opportunity */}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Est. Revenue: <span style={{ color: 'var(--brand-amber)' }}>{evt.revenue}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}>
                      <TrendingUp size={12} color={OPP_COLORS[evt.opportunity]} />
                      <span style={{ color: OPP_COLORS[evt.opportunity], fontWeight: 600 }}>{evt.opportunity} Opportunity</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div>
          <p className="section-title">Event Detail</p>
          {selected ? (
            <div className="panel" style={{ position: 'sticky', top: 0 }}>
              <div className="panel-header">
                <span className="panel-title">
                  <CalendarDays size={14} className="panel-title-icon" />
                  {selected.name}
                </span>
                <span className="tag tag-orange">{selected.type}</span>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Time + Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <CalendarDays size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{selected.date} · {selected.time}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{selected.location}</span>
                  </div>
                </div>

                {/* Key metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Expected Footfall', value: selected.expectedFootfall.toLocaleString(), unit: 'people' },
                    { label: 'Heat Index',         value: `${selected.heatIndex}°C`, unit: '' },
                    { label: 'AQI Level',          value: selected.aqi, unit: '' },
                    { label: 'Shade Available',    value: selected.shadeAvailable, unit: '' },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Revenue */}
                <div style={{
                  background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Estimated Revenue</div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-amber)' }}>{selected.revenue}</div>
                </div>

                {/* Notes */}
                <div style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Operational Notes</div>
                  {selected.notes}
                </div>

                <button className="layer-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700, background: 'var(--brand-primary-dim)', border: '1px solid var(--border-brand)', color: 'var(--brand-primary)' }}>
                  Mark as Target Event
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <CalendarDays size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>Select an event to view full details and operational guidance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
