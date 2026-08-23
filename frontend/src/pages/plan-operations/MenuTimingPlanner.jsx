import { useState } from 'react';
import { UtensilsCrossed, CheckCircle, AlertCircle, XCircle, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

const RISK_CONFIG = {
  safe:     { color: 'var(--status-ok)',       bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  label: 'Safe',     Icon: CheckCircle },
  caution:  { color: 'var(--status-warning)',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Caution',  Icon: AlertCircle },
  critical: { color: 'var(--status-critical)', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  label: 'Critical', Icon: XCircle },
  avoid:    { color: '#9333ea',                bg: 'rgba(147,51,234,0.10)', border: 'rgba(147,51,234,0.25)', label: 'Avoid',    Icon: XCircle },
};

const WINDOW_CONFIG = {
  recommended: { color: 'var(--status-ok)',       bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)' },
  avoid:       { color: 'var(--status-critical)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)' },
  secondary:   { color: 'var(--status-info)',      bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)' },
};

export default function MenuTimingPlanner() {
  const [activeWindow, setActiveWindow] = useState('morning');
  const { dashboardData, loading, error } = useApp();
  const hi = dashboardData?.thermal?.current?.heat_index_c ?? dashboardData?.thermal?.current?.temperature_c ?? 35;

  // Generate menu windows from real thermal data
  const windows = [
    { id: 'morning', label: 'Morning Window', time: '7:30 – 11:00 AM', heatIndex: `${Math.round(hi * 0.8)}°C`, status: 'recommended',
      menuItems: [
        { name: 'Hot Coffee & Tea', risk: 'safe', note: 'Ideal in morning temperatures' },
        { name: 'Fresh Pastries', risk: 'safe', note: 'Best served before 10 AM' },
        { name: 'Ice Cream', risk: 'caution', note: 'Monitor display temps closely' },
        { name: 'Salads & Cold Wraps', risk: 'safe', note: 'Safe in morning conditions' },
      ]},
    { id: 'midday', label: 'Peak Heat', time: '11:30 AM – 4:30 PM', heatIndex: `${Math.round(hi)}°C`, status: 'avoid',
      menuItems: [
        { name: 'Hot Coffee & Tea', risk: 'safe', note: 'Reduced demand but safe' },
        { name: 'Ice Cream', risk: 'critical', note: 'Melting risk very high — avoid' },
        { name: 'Salads & Cold Wraps', risk: 'critical', note: 'Danger zone — rapid spoilage risk' },
        { name: 'Smoothies & Cold Drinks', risk: 'caution', note: 'High demand but monitor temps' },
      ]},
    { id: 'evening', label: 'Evening Window', time: '5:00 – 7:30 PM', heatIndex: `${Math.round(hi * 0.85)}°C`, status: 'secondary',
      menuItems: [
        { name: 'Hot Items', risk: 'safe', note: 'Temperatures allow safe service' },
        { name: 'Ice Cream', risk: 'caution', note: 'Better but still monitor closely' },
        { name: 'Salads & Cold Wraps', risk: 'safe', note: 'Cooling conditions favorable' },
        { name: 'Grilled Items', risk: 'safe', note: 'Peak evening demand' },
      ]},
  ];
  const topRecommendations = [
    { item: 'Cold Beverages', reason: 'Highest demand during heat — safe across all windows', window: 'All Day' },
    { item: 'Hot Items (Morning)', reason: 'Best margins before 11 AM when heat is manageable', window: 'Morning' },
    { item: 'Grilled Items (Evening)', reason: 'Peak footfall + safe temps for outdoor cooking', window: 'Evening' },
  ];
  const currentWindow = windows.find(w => w.id === activeWindow);

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
    <div className="page-scroll">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <UtensilsCrossed size={24} color="var(--brand-teal)" />
          </div>
          <div>
            <h1 className="page-title">Menu Timing Planner</h1>
            <p className="page-desc">
              Know which menu items are safe and profitable for each operating window. Adapt your offerings to the thermal conditions of the day.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">12-Hour Heat Outlook</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Solar Exposure</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Operating Window Planner</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Menu Timing Planner</span>
        </div>
      </div>

      {/* Window selector tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {windows.map(w => {
          const cfg = WINDOW_CONFIG[w.status];
          const isActive = w.id === activeWindow;
          return (
            <button
              key={w.id}
              onClick={() => setActiveWindow(w.id)}
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${isActive ? cfg.border : 'var(--border-subtle)'}`,
                background: isActive ? cfg.bg : 'var(--bg-card)',
                color: isActive ? cfg.color : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, color: isActive ? cfg.color : 'var(--text-primary)' }}>
                {w.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{w.time}</div>
              <div style={{ fontSize: '0.73rem', color: isActive ? cfg.color : 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                Heat Index: {w.heatIndex}
              </div>
            </button>
          );
        })}
      </div>

      {/* Menu items grid for selected window */}
      {currentWindow && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <span className="panel-title">
              <UtensilsCrossed size={14} className="panel-title-icon" />
              Menu Safety — {currentWindow.label}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 99,
              background: WINDOW_CONFIG[currentWindow.status].bg,
              border: `1px solid ${WINDOW_CONFIG[currentWindow.status].border}`,
              color: WINDOW_CONFIG[currentWindow.status].color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {currentWindow.time}
            </span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {currentWindow.menuItems.map(item => {
                const cfg = RISK_CONFIG[item.risk];
                const { Icon } = cfg;
                return (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 16px',
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Icon size={18} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 3 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.note}</div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 99,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      color: cfg.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <span className="panel-title">Risk Level Guide</span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(RISK_CONFIG).map(([key, cfg]) => {
              const { Icon } = cfg;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Icon size={14} color={cfg.color} />
                  <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            <Star size={14} className="panel-title-icon" style={{ color: 'var(--brand-amber)' }} />
            All-Day Top Recommendations
          </span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topRecommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 18px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-amber))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem', color: 'white',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{rec.item}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{rec.reason}</div>
                </div>
                <span className="tag tag-teal">{rec.window}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </DataGuard>
  );
}
