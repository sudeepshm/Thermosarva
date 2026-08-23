import { useState } from 'react';
import { TriangleAlert, Thermometer, Refrigerator, HardHat, Utensils, Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';

const ICON_MAP = { Thermometer, Refrigerator, HardHat, Utensils };

export default function CriticalConditionAlerts() {
  const [dismissed, setDismissed] = useState([]);
  const { dashboardData, loading, error, location } = useApp();

  // Build alerts from safety assessments
  const safety = dashboardData?.safety ?? {};
  const generatedAlerts = [];

  const crew = safety.crew ?? {};
  if (crew.category === 'CRITICAL' || crew.category === 'HIGH_HEAT') {
    generatedAlerts.push({
      id: 'crew-heat',
      severity: crew.category === 'CRITICAL' ? 'critical' : 'warning',
      title: `Crew Heat Safety: ${crew.category === 'CRITICAL' ? 'CRITICAL' : 'High Heat'}`,
      message: `Heat index ${crew.heat_index_c != null ? Math.round(crew.heat_index_c) + '°C' : 'elevated'}. Break every ${crew.recommended_break_frequency_minutes ?? '--'} min required.`,
      icon: 'HardHat',
      category: 'Crew Safety',
      time: 'Now',
      actionRequired: crew.category === 'CRITICAL',
    });
  }

  const cold = safety.cold_storage ?? {};
  if (cold.external_thermal_pressure === 'HIGH_THERMAL_PRESSURE' || cold.external_thermal_pressure === 'ELEVATED_COOLING_DEMAND') {
    generatedAlerts.push({
      id: 'cold-storage',
      severity: cold.external_thermal_pressure === 'HIGH_THERMAL_PRESSURE' ? 'critical' : 'warning',
      title: `Cold Storage: ${cold.external_thermal_pressure === 'HIGH_THERMAL_PRESSURE' ? 'High Pressure' : 'Elevated Demand'}`,
      message: `External temp ${cold.external_temperature_c != null ? Math.round(cold.external_temperature_c) + '°C' : 'high'}. Equipment under thermal stress.`,
      icon: 'Refrigerator',
      category: 'Cold Storage',
      time: 'Now',
      actionRequired: cold.external_thermal_pressure === 'HIGH_THERMAL_PRESSURE',
    });
  }

  const food = safety.food ?? {};
  if (food.environmental_exposure_category === 'HIGH_ENVIRONMENTAL_EXPOSURE' || food.environmental_exposure_category === 'ELEVATED_ENVIRONMENTAL_EXPOSURE') {
    generatedAlerts.push({
      id: 'food-safety',
      severity: food.environmental_exposure_category === 'HIGH_ENVIRONMENTAL_EXPOSURE' ? 'critical' : 'warning',
      title: `Food Safety: ${food.environmental_exposure_category === 'HIGH_ENVIRONMENTAL_EXPOSURE' ? 'High Exposure' : 'Elevated Exposure'}`,
      message: `Ambient ${food.ambient_temperature_c != null ? Math.round(food.ambient_temperature_c) + '°C' : 'elevated'}. ${food.recommendations?.[0] ?? 'Monitor conditions.'}`,
      icon: 'Utensils',
      category: 'Food Safety',
      time: 'Now',
      actionRequired: food.environmental_exposure_category === 'HIGH_ENVIRONMENTAL_EXPOSURE',
    });
  }

  // Check thermal current for extreme heat
  const current = dashboardData?.thermal?.current ?? {};
  if (current.heat_index_c > 43) {
    generatedAlerts.push({
      id: 'extreme-heat',
      severity: 'critical',
      title: 'Extreme Heat Warning',
      message: `Heat index at ${Math.round(current.heat_index_c)}°C. Suspend non-essential outdoor operations immediately.`,
      icon: 'Thermometer',
      category: 'Environmental',
      time: 'Now',
      actionRequired: true,
    });
  }

  // If no alerts from conditions, show info
  if (generatedAlerts.length === 0) {
    generatedAlerts.push({
      id: 'all-ok',
      severity: 'info',
      title: 'All Systems Normal',
      message: `Environmental conditions at ${location.city || 'this location'} are within acceptable ranges.`,
      icon: 'Thermometer',
      category: 'General',
      time: 'Now',
      actionRequired: false,
    });
  }

  const activeAlerts = generatedAlerts.filter(a => !dismissed.includes(a.id));
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <TriangleAlert size={24} color="var(--status-critical)" />
            </div>
            <div>
              <h1 className="page-title">Critical Condition Alerts</h1>
              <p className="page-desc">
                Event-driven alerts from crew safety, equipment protection, and food safety — generated from live environmental conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="metric-grid" style={{ marginBottom: 24 }}>
          <div className="metric-card">
            <span className="metric-label">Active Alerts</span>
            <span className="metric-value" style={{ color: criticalCount > 0 ? 'var(--status-critical)' : 'var(--status-ok)' }}>{activeAlerts.length}</span>
            <span className="metric-sub">From live conditions</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Critical</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{criticalCount}</span>
            {criticalCount > 0 && <span className="metric-badge" style={{ background: 'var(--status-critical-dim)', color: 'var(--status-critical)', marginTop: 4 }}>Immediate Action</span>}
          </div>
          <div className="metric-card">
            <span className="metric-label">Warnings</span>
            <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{activeAlerts.filter(a => a.severity === 'warning').length}</span>
            <span className="metric-sub">Monitor closely</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Info</span>
            <span className="metric-value" style={{ color: 'var(--status-info)' }}>{activeAlerts.filter(a => a.severity === 'info').length}</span>
            <span className="metric-sub">No action required</span>
          </div>
        </div>

        <p className="section-title"><Bell size={12} /> Active Alerts — Live Conditions</p>

        {activeAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCheck size={40} color="var(--status-ok)" />
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', color: 'var(--status-ok)' }}>All Clear</div>
            <div style={{ fontSize: '0.85rem' }}>No active alerts at this time.</div>
          </div>
        ) : (
          <div className="alert-cards">
            {activeAlerts.sort((a, b) => {
              const order = { critical: 0, warning: 1, info: 2 };
              return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
            }).map((alert, idx) => {
              const Icon = ICON_MAP[alert.icon] || TriangleAlert;
              return (
                <div key={alert.id} className={`alert-card ${alert.severity}`} style={{ animationDelay: `${idx * 0.07}s` }}>
                  <div className="alert-icon-wrap"><Icon size={18} /></div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span className="alert-time">{alert.time}</span>
                      <span className="alert-category">{alert.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    {alert.actionRequired && <button className="alert-action">Action Required</button>}
                    <button onClick={() => setDismissed(d => [...d, alert.id])} style={{ background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 99, padding: '2px 10px', fontSize: '0.68rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {dismissed.length > 0 && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button onClick={() => setDismissed([])} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.8rem' }}>
              Restore {dismissed.length} dismissed alert{dismissed.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </DataGuard>
  );
}
