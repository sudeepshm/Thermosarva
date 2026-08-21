import { useState } from 'react';
import { TriangleAlert, Thermometer, Refrigerator, HardHat, Utensils, CalendarRange, Bell, CheckCheck } from 'lucide-react';
import { criticalAlertsData } from '../../data/mockData';

const ICON_MAP = { Thermometer, Refrigerator, HardHat, Utensils, CalendarRange };

export default function CriticalConditionAlerts() {
  const [dismissed, setDismissed] = useState([]);

  const activeAlerts = criticalAlertsData.filter(a => !dismissed.includes(a.id));
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <TriangleAlert size={24} color="var(--status-critical)" />
          </div>
          <div>
            <h1 className="page-title">Critical Condition Alerts</h1>
            <p className="page-desc">
              Event-driven alerts from across the product — heat, equipment, crew safety, and food safety all in one urgent view.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Any Critical Condition</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Environmental Risk Center</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Critical Condition Alerts</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="metric-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card">
          <span className="metric-label">Active Alerts</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{activeAlerts.length}</span>
          <span className="metric-sub">Across all categories</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Critical Severity</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{criticalCount}</span>
          <span className={`metric-badge`} style={{
            background: 'var(--status-critical-dim)',
            color: 'var(--status-critical)',
            marginTop: 4,
            display: 'inline-block',
          }}>Immediate Action</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Warnings</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>
            {activeAlerts.filter(a => a.severity === 'warning').length}
          </span>
          <span className="metric-sub">Monitor closely</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Informational</span>
          <span className="metric-value" style={{ color: 'var(--status-info)' }}>
            {activeAlerts.filter(a => a.severity === 'info').length}
          </span>
          <span className="metric-sub">No action required</span>
        </div>
      </div>

      {/* Alert cards */}
      <p className="section-title">
        <Bell size={12} /> Active Alerts — Waze/Motive Priority View
      </p>

      {activeAlerts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <CheckCheck size={40} color="var(--status-ok)" />
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', color: 'var(--status-ok)' }}>
            All Clear
          </div>
          <div style={{ fontSize: '0.85rem' }}>No active alerts at this time.</div>
        </div>
      ) : (
        <div className="alert-cards">
          {/* Sort: critical first */}
          {activeAlerts
            .slice()
            .sort((a, b) => {
              const order = { critical: 0, warning: 1, info: 2 };
              return order[a.severity] - order[b.severity];
            })
            .map((alert, idx) => {
              const Icon = ICON_MAP[alert.icon] || TriangleAlert;
              return (
                <div
                  key={alert.id}
                  className={`alert-card ${alert.severity}`}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="alert-icon-wrap">
                    <Icon size={18} />
                  </div>

                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span className="alert-time">{alert.time}</span>
                      <span className="alert-category">{alert.category}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    {alert.actionRequired && (
                      <button className="alert-action">Action Required</button>
                    )}
                    <button
                      onClick={() => setDismissed(d => [...d, alert.id])}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-default)',
                        borderRadius: 99,
                        padding: '2px 10px',
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {dismissed.length > 0 && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={() => setDismissed([])}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Restore {dismissed.length} dismissed alert{dismissed.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
