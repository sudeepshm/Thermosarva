import { Clock3, Thermometer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const RISK_COLORS = { low: '#22c55e', moderate: '#84cc16', high: '#f59e0b', critical: '#ef4444' };
const RISK_BG    = { low: '#16a34a33', moderate: '#65a30d33', high: '#d9770633', critical: '#dc262633' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Temp: {d?.temp}°C</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#ef4444' }} />Heat Index: {d?.heatIndex}°C</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#3b82f6' }} />UV Index: {d?.uvIndex}</div>
      <div style={{ marginTop: 6 }}>
        <span style={{
          background: RISK_BG[d?.risk], color: RISK_COLORS[d?.risk],
          padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700
        }}>
          {d?.risk?.toUpperCase()} RISK
        </span>
      </div>
    </div>
  );
};

export default function HeatOutlook() {
  const { dashboardData, loading, error } = useApp();

  // Map backend forecast items to chart-friendly shape
  const outlookRaw = dashboardData?.thermal?.outlook;
  const forecastItems = outlookRaw?.forecast ?? [];
  const chartData = forecastItems.map((item, i) => {
    const hour = new Date(item.timestamp || Date.now() + i * 3600000);
    const label = hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const hi = item.heat_index_c ?? item.temperature_c ?? 30;
    const risk = hi >= 43 ? 'critical' : hi >= 39 ? 'high' : hi >= 35 ? 'moderate' : 'low';
    return { hour: label, temp: Math.round(item.temperature_c ?? 30), heatIndex: Math.round(hi), uvIndex: item.uv_index ?? 0, risk };
  });

  const currentHour = chartData[0] ?? {};
  const peakHI = chartData.reduce((mx, d) => (d.heatIndex ?? 0) > (mx?.heatIndex ?? 0) ? d : mx, null);
  const peakUV = chartData.reduce((mx, d) => (d.uvIndex ?? 0) > (mx?.uvIndex ?? 0) ? d : mx, null);
  const safeHours = chartData.filter(d => d.risk === 'low').length;

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <Clock3 size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h1 className="page-title">12-Hour Heat Outlook</h1>
              <p className="page-desc">
                Hourly temperature, heat index, and UV projections for the next 12 hours. Foundation for operating window planning and safety decisions.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step current">12-Hour Heat Outlook</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Operating Window Planner</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Crew Safety</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Food Safety Guard</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Current Temp</span>
            <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>{currentHour.temp != null ? `${currentHour.temp}°C` : '--'}</span>
            <span className="metric-sub">Now</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Heat Index Now</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{currentHour.heatIndex != null ? `${currentHour.heatIndex}°C` : '--'}</span>
            {currentHour.risk && (
              <span className="metric-badge" style={{ background: RISK_BG[currentHour.risk], color: RISK_COLORS[currentHour.risk], marginTop: 4 }}>
                {currentHour.risk.charAt(0).toUpperCase() + currentHour.risk.slice(1)} Risk
              </span>
            )}
          </div>
          <div className="metric-card">
            <span className="metric-label">Peak Heat Index</span>
            <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{peakHI ? `${peakHI.heatIndex}°C` : '--'}</span>
            <span className="metric-sub">{peakHI?.hour ?? '--'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">UV Index Peak</span>
            <span className="metric-value">{peakUV?.uvIndex ?? '--'}</span>
            <span className="metric-sub">{peakUV?.hour ?? '--'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Safe Hours</span>
            <span className="metric-value" style={{ color: 'var(--status-ok)' }}>{safeHours}</span>
            <span className="metric-sub">Low risk windows</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Source</span>
            <span className="metric-value" style={{ fontSize: '0.85rem' }}>{outlookRaw?.data_source ?? 'Stub'}</span>
            <span className="metric-sub">{outlookRaw?.date ?? ''}</span>
          </div>
        </div>

        <div className="panel mb-20">
          <div className="panel-header">
            <span className="panel-title"><Thermometer size={14} className="panel-title-icon" /> Temperature &amp; Heat Index Forecast</span>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
              {[{ color: '#f97316', label: 'Temperature' }, { color: '#ef4444', label: 'Heat Index' }].map(i => (
                <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                  <div style={{ width: 8, height: 2, background: i.color, borderRadius: 2 }} />
                  {i.label}
                </div>
              ))}
            </div>
          </div>
          <div className="panel-body">
            <div className="chart-container-tall">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradHeat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="°" />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={40} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Critical 40°C', fill: '#ef4444', fontSize: 10 }} />
                    <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fill="url(#gradTemp)" name="Temp" />
                    <Area type="monotone" dataKey="heatIndex" stroke="#ef4444" strokeWidth={2} fill="url(#gradHeat)" name="Heat Index" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="skeleton" style={{ height: '100%' }} />
              )}
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Hourly Risk Band</span>
            </div>
            <div className="panel-body">
              <div className="timeline-strip">
                {chartData.map(d => (
                  <div key={d.hour} className="timeline-cell"
                    style={{ background: RISK_COLORS[d.risk] + '33', color: RISK_COLORS[d.risk] }}
                    title={`${d.hour}: ${d.risk} risk`}>
                    {d.risk === 'critical' ? '🔴' : d.risk === 'high' ? '🟠' : d.risk === 'moderate' ? '🟡' : '🟢'}
                  </div>
                ))}
              </div>
              <div className="timeline-labels">
                {chartData.filter((_, i) => i % 2 === 0).map(d => <span key={d.hour}>{d.hour}</span>)}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: '0.73rem', flexWrap: 'wrap' }}>
                {Object.entries(RISK_COLORS).map(([level, color]) => (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DataGuard>
  );
}
