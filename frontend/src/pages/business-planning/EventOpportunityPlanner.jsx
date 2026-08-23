import { useState } from 'react';
import { CalendarDays, MapPin, Users, Thermometer, Wind, Trees, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

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
  const { dashboardData, loading, error, location } = useApp();
  const current = dashboardData?.thermal?.current ?? {};
  const hi = current?.heat_index_c ?? current?.temperature_c ?? 32;

  const eventOpportunityData = [
    {
      id: 1,
      name: `${location.city || 'Downtown'} Weekend Food & Music Fest`,
      date: 'This Saturday',
      time: '11:00 AM – 9:00 PM',
      location: `${location.city || 'Central'} Plaza Grounds`,
      type: 'Festival',
      footfall: '8,000 – 12,000',
      opportunity: 'Very High',
      thermalForecast: hi > 40 ? 'avoid' : hi > 34 ? 'caution' : 'good',
      heatIndex: Math.round(hi),
      aqi: current?.aqi ? `${current.aqi} AQI` : 'Moderate',
      shadeAvailable: 'Partial (Tents & Trees)',
      revenue: '$2,800 – $4,200',
      notes: 'Peak footfall expected between 12 PM - 3 PM and 6 PM - 8 PM. Plan cold beverage stock and cooling breaks for staff.',
    },
    {
      id: 2,
      name: `${location.city || 'Metro'} Community Farmers Market`,
      date: 'Sunday Morning',
      time: '7:30 AM – 1:00 PM',
      location: `${location.city || 'North'} Pavilion`,
      type: 'Market',
      footfall: '3,500 – 5,000',
      opportunity: 'High',
      thermalForecast: 'good',
      heatIndex: Math.max(22, Math.round(hi * 0.8)),
      aqi: 'Good',
      shadeAvailable: 'High (Covered Pavilion)',
      revenue: '$1,400 – $2,200',
      notes: 'Morning hours avoid peak heat index window. High conversion rate for breakfast, coffee, and grab-and-go items.',
    },
    {
      id: 3,
      name: `${location.city || 'Tech'} District Night Bazaar`,
      date: 'Next Friday',
      time: '6:00 PM – 11:00 PM',
      location: `${location.city || 'Innovation'} Way`,
      type: 'Evening Market',
      footfall: '5,000 – 7,500',
      opportunity: 'High',
      thermalForecast: 'good',
      heatIndex: Math.max(24, Math.round(hi * 0.85)),
      aqi: 'Moderate',
      shadeAvailable: 'N/A (Night Event)',
      revenue: '$2,000 – $3,100',
      notes: 'Optimal thermal timing after sunset. High evening diner demand. Standard operations recommended.',
    },
  ];

  const goodCount = eventOpportunityData.filter(e => e.thermalForecast === 'good').length;
  const cautionCount = eventOpportunityData.filter(e => e.thermalForecast === 'caution').length;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
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
                Discover upcoming local events in {location.city || 'your area'} and evaluate each one against thermal conditions, footfall, and revenue potential before committing.
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
            <span className="metric-sub">In {location.city || 'active area'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Favorable</span>
            <span className="metric-value" style={{ color: 'var(--status-ok)' }}>{goodCount}</span>
            <span className="metric-sub">Good thermal conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Caution</span>
            <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{cautionCount}</span>
            <span className="metric-sub">Manage timing carefully</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Current Heat Index</span>
            <span className="metric-value" style={{ fontSize: '1.2rem', color: hi > 38 ? 'var(--status-critical)' : 'var(--status-warning)' }}>
              {Math.round(hi)}°C
            </span>
            <span className="metric-sub">Reference baseline</span>
          </div>
        </div>

        {/* Two col layout */}
        <div className="two-col">
          {/* Events List */}
          <div>
            <p className="section-title">Opportunity Events</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {eventOpportunityData.map(ev => {
                const fCfg = FORECAST_CONFIG[ev.thermalForecast];
                const isSelected = selected?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelected(ev)}
                    style={{
                      background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{ev.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={12} /> {ev.location} · {ev.date}
                        </div>
                      </div>
                      <span className="tag" style={{ background: fCfg.bg, color: fCfg.color, border: `1px solid ${fCfg.border}`, fontSize: '0.72rem' }}>
                        {fCfg.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                      <span><Users size={12} style={{ display: 'inline', marginRight: 4 }} /> {ev.footfall}</span>
                      <span><Thermometer size={12} style={{ display: 'inline', marginRight: 4 }} /> {ev.heatIndex}°C</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 700, color: OPP_COLORS[ev.opportunity] }}>{ev.opportunity} Potential</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="section-title">Event Thermal Analysis</p>
            {selected ? (
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">{selected.name}</span>
                </div>
                <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="two-col" style={{ gap: 10 }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Window</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 4 }}>{selected.time}</div>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Forecast Heat Index</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: FORECAST_CONFIG[selected.thermalForecast].color, marginTop: 4 }}>{selected.heatIndex}°C</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Estimated Revenue</div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-amber)' }}>{selected.revenue}</div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Operational Guidance</div>
                    {selected.notes}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CalendarDays size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>Select an event to view full thermal and revenue details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
