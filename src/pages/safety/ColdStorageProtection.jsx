import { Refrigerator, Thermometer, Zap } from 'lucide-react';
import { coldStorageData } from '../../data/mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {p.name}: {p.value}{p.name === 'Compressor Load' ? '%' : '°C'}
        </div>
      ))}
    </div>
  );
};

export default function ColdStorageProtection() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Refrigerator size={24} color="var(--status-info)" />
          </div>
          <div>
            <h1 className="page-title">Cold Storage Protection</h1>
            <p className="page-desc">
              Monitor truck internal temperatures, compressor load, and refrigeration risk across all perishable items.
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

      {/* Alert */}
      <div style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <Refrigerator size={20} color="var(--status-critical)" />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Compressor at {coldStorageData.compressorLoad}% load</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.8rem' }}>Frozen items at critical risk between 11 AM – 2 PM</span>
        </div>
        <span className="tag tag-red"><Zap size={10} /> At Limit</span>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Internal Temp</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)' }}>{coldStorageData.truckTemp}°C</span>
          <span className="metric-sub">Currently within range</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">External Temp</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{coldStorageData.externalTemp}°C</span>
          <span className="metric-sub">Ambient outside</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Differential</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>{coldStorageData.differential}°C</span>
          <span className="metric-sub">Load on compressor</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Compressor Load</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{coldStorageData.compressorLoad}%</span>
          <span className="metric-sub">Max recommended: 80%</span>
        </div>
      </div>

      <div className="two-col">
        {/* Temperature Forecast Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Thermometer size={14} className="panel-title-icon" /> Temperature & Load Forecast</span>
          </div>
          <div className="panel-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coldStorageData.forecast} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="external" name="External Temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="internal" name="Internal Temp" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="load" name="Compressor Load" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Item Status */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Item Storage Status</span>
          </div>
          <div className="panel-body">
            {coldStorageData.items.map(item => (
              <div key={item.name} className={`storage-item-row`}>
                <div>
                  <div className="storage-item-name">{item.name}</div>
                  <div className="storage-item-req">{item.tempRequired}</div>
                </div>
                <span style={{
                  fontSize: '0.78rem', color: 'var(--text-muted)'
                }}>
                  {item.currentRisk} Risk
                </span>
                <span className={`tag tag-${item.status === 'critical' ? 'red' : item.status === 'warning' ? 'yellow' : 'green'}`}>
                  {item.status === 'critical' ? '⚠ Critical' : item.status === 'warning' ? '! Caution' : '✓ OK'}
                </span>
              </div>
            ))}

            <div className="divider" />
            <p className="section-title">High-Risk Hours</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {coldStorageData.riskHours.map(h => (
                <span key={h} className="tag tag-red">{h}</span>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
              Consider relocating to shade or pre-cooling stock before these windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
