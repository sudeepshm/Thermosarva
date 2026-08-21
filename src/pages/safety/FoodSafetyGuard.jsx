import { Utensils, Clock, AlertTriangle } from 'lucide-react';
import { foodSafetyData } from '../../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row">
        <div className="tt-dot" style={{ background: '#f97316' }} />
        Food Risk Score: {payload[0]?.value}
      </div>
    </div>
  );
};

export default function FoodSafetyGuard() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <Utensils size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">Food Safety Guard</h1>
            <p className="page-desc">
              Track food safety compliance across hot items, cold items, and ready-to-eat foods based on current ambient and operating conditions.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Environmental Conditions</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Food Storage Context</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Operating Duration</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Food Safety Guard</span>
        </div>
      </div>

      {/* Danger zone banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(245,158,11,0.05))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        marginBottom: 20,
      }}>
        <AlertTriangle size={20} color="var(--status-critical)" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Danger Zone Active — Ambient {foodSafetyData.currentAmbient}°C
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Temperature danger zone is 5–60°C. Current ambient creates high food spoilage risk.
          </div>
        </div>
        <span className="tag tag-red" style={{ marginLeft: 'auto' }}>High Risk</span>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Ambient Temp</span>
          <span className="metric-value" style={{ color: 'var(--status-critical)' }}>{foodSafetyData.currentAmbient}°C</span>
          <span className="metric-sub">Well inside danger zone</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Danger Zone Risk</span>
          <span className="metric-value" style={{ fontSize: '1rem' }}>{foodSafetyData.dangerZoneRisk}</span>
          <span className="metric-badge" style={{ background: 'var(--status-critical-dim)', color: 'var(--status-critical)', marginTop: 4 }}>Action Required</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Ready-to-Eat Timer</span>
          <span className="metric-value" style={{ color: 'var(--status-warning)' }}>1h 45m</span>
          <span className="metric-sub">15 min remaining of 2h limit</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Compliant Items</span>
          <span className="metric-value" style={{ color: 'var(--status-ok)' }}>2/4</span>
          <span className="metric-sub">2 require attention</span>
        </div>
      </div>

      <div className="two-col">
        {/* Risk Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><Clock size={14} className="panel-title-icon" /> Food Safety Risk by Hour</span>
          </div>
          <div className="panel-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={foodSafetyData.riskByHour} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradFoodRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={70} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'High Risk', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="risk" name="Risk Score" stroke="#f97316" strokeWidth={2} fill="url(#gradFoodRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Item Guidelines */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Food Item Compliance</span>
          </div>
          <div className="panel-body">
            <div className="safety-list">
              {foodSafetyData.guidelines.map(g => (
                <div key={g.item} className={`safety-row status-${g.status}`}>
                  <div className="safety-dot" />
                  <div style={{ flex: 1 }}>
                    <div className="safety-label">{g.item}</div>
                    <div className="safety-value" style={{ fontSize: '0.73rem', marginTop: 2 }}>{g.requirement}</div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '2px 8px', borderRadius: 99
                  }}>
                    {g.note}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <p className="section-title">Key Rules</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              • Hot foods must stay above <strong style={{ color: 'var(--text-primary)' }}>60°C</strong><br />
              • Cold foods must stay below <strong style={{ color: 'var(--text-primary)' }}>5°C</strong><br />
              • Never leave ready-to-eat food for more than <strong style={{ color: 'var(--text-primary)' }}>2 hours</strong> in the danger zone<br />
              • Discard if unsure — do not risk customer health
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
