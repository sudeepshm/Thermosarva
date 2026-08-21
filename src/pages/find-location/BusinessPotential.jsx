import { ChartNoAxesCombined, Briefcase, GraduationCap, Train, ShoppingBag, Camera, Home, TrendingUp } from 'lucide-react';
import { businessCategories } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const ICON_MAP = { Briefcase, GraduationCap, Train, ShoppingBag, Camera, Home };
const BAR_COLORS = ['#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Score: {payload[0]?.value}</div>
    </div>
  );
};

export default function BusinessPotential() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <ChartNoAxesCombined size={24} color="var(--brand-amber)" />
          </div>
          <div>
            <h1 className="page-title">Business Potential Insights</h1>
            <p className="page-desc">
              Understand demand by customer segment. Powered by nearby activity data and time-of-day context.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Location Planner</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Nearby Activity Explorer</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Business Potential Insights</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step">Location Comparison</span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Overall BP Score</span>
          <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>94</span>
          <span className="metric-sub">University Zone, Indiranagar</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Peak Footfall</span>
          <span className="metric-value">8–9:30 AM</span>
          <span className="metric-sub">Morning rush window</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Daily Reach</span>
          <span className="metric-value">13.7K</span>
          <span className="metric-sub">Estimated unique footfall</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Top Segment</span>
          <span className="metric-value" style={{ fontSize: '1.1rem' }}>Students</span>
          <span className="metric-sub">Score 94 · 1,800 daily</span>
        </div>
      </div>

      <div className="two-col">
        {/* Bar Chart */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title"><TrendingUp size={14} className="panel-title-icon" /> Segment Potential Scores</span>
          </div>
          <div className="panel-body">
            <div className="chart-container-tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={businessCategories} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {businessCategories.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Segment Details */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Segment Breakdown</span>
          </div>
          <div className="panel-body">
            {businessCategories.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon] || Briefcase;
              return (
                <div key={cat.category} className="biz-row">
                  <div className="biz-icon-wrap" style={{ background: `${BAR_COLORS[i]}22` }}>
                    <Icon size={14} color={BAR_COLORS[i]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="biz-label">{cat.category}</div>
                    <div className="biz-count">{cat.count.toLocaleString()} estimated daily</div>
                    <div className="progress-bar" style={{ marginTop: 6, height: 5, maxWidth: 160 }}>
                      <div className="progress-fill" style={{ width: `${cat.score}%`, background: BAR_COLORS[i] }} />
                    </div>
                  </div>
                  <div className="biz-score" style={{ color: BAR_COLORS[i] }}>{cat.score}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time-of-day insight */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Peak Demand Windows</span>
        </div>
        <div className="panel-body">
          <div className="op-window-band">
            <div className="op-time-row">
              <span className="op-label">Morning Peak</span>
              <div className="op-bar-track">
                <div className="op-bar-fill good" style={{ width: '40%' }}>8:00 AM – 9:30 AM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-ok)' }}>Very High</span>
            </div>
            <div className="op-time-row">
              <span className="op-label">Lunch Rush</span>
              <div className="op-bar-track">
                <div className="op-bar-fill secondary" style={{ width: '55%', marginLeft: '40%' }}>12:00 – 1:30 PM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-info)' }}>High</span>
            </div>
            <div className="op-time-row">
              <span className="op-label">Evening Window</span>
              <div className="op-bar-track">
                <div className="op-bar-fill good" style={{ width: '30%', marginLeft: '72%' }}>5:30–7:00 PM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-ok)' }}>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
