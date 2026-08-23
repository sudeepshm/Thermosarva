import { ChartNoAxesCombined, Briefcase, GraduationCap, Train, ShoppingBag, Camera, Home, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const { dashboardData, loading, error, location } = useApp();
  const businessRaw = dashboardData?.location_context?.business ?? {};
  const nearbyRaw = dashboardData?.location_context?.nearby ?? {};

  const overallScore = businessRaw.business_potential_score ?? businessRaw.score ?? null;
  const categories = nearbyRaw?.categories ?? {};

  // Build business categories from nearby POI data
  const businessCategories = Object.entries(categories).map(([cat, items], i) => ({
    category: cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: Array.isArray(items) ? items.length : 0,
    score: Math.min(100, (Array.isArray(items) ? items.length : 0) * 12 + 20),
    icon: ['Briefcase', 'GraduationCap', 'Train', 'ShoppingBag', 'Camera', 'Home'][i % 6],
  })).sort((a, b) => b.score - a.score).slice(0, 6);

  const topSegment = businessCategories[0]?.category ?? '--';

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <ChartNoAxesCombined size={24} color="var(--brand-amber)" />
            </div>
            <div>
              <h1 className="page-title">Business Potential Insights</h1>
              <p className="page-desc">
                Demand analysis based on nearby activity and environmental context for {location.city || 'your location'}.
              </p>
            </div>
          </div>
          <div className="dependency-trail">
            <span className="dep-step">Location Planner</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step">Nearby Activity Explorer</span>
            <span className="dep-arrow">→</span>
            <span className="dep-step current">Business Potential Insights</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Overall BP Score</span>
            <span className="metric-value" style={{ color: 'var(--brand-amber)' }}>{overallScore ?? (businessCategories.length > 0 ? Math.round(businessCategories.reduce((s, c) => s + c.score, 0) / businessCategories.length) : '--')}</span>
            <span className="metric-sub">{location.city || 'Selected Location'}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">POI Categories</span>
            <span className="metric-value">{businessCategories.length}</span>
            <span className="metric-sub">Types of demand centers</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total Nearby POIs</span>
            <span className="metric-value">{Object.values(categories).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)}</span>
            <span className="metric-sub">From OpenStreetMap</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Top Segment</span>
            <span className="metric-value" style={{ fontSize: '1rem' }}>{topSegment}</span>
            <span className="metric-sub">{businessCategories[0]?.count ?? 0} locations</span>
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
                {businessCategories.length > 0 ? (
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
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No nearby activity data available
                  </div>
                )}
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
                      <div className="biz-count">{cat.count} nearby locations</div>
                      <div className="progress-bar" style={{ marginTop: 6, height: 5, maxWidth: 160 }}>
                        <div className="progress-fill" style={{ width: `${cat.score}%`, background: BAR_COLORS[i] }} />
                      </div>
                    </div>
                    <div className="biz-score" style={{ color: BAR_COLORS[i] }}>{cat.score}</div>
                  </div>
                );
              })}
              {businessCategories.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No POI categories found nearby.</div>
              )}
            </div>
          </div>
        </div>

        {/* Insight from business engine */}
        {businessRaw.interpretation && (
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Business Intelligence</span></div>
            <div className="panel-body">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{businessRaw.interpretation}</div>
              <div style={{ marginTop: 12 }}><span className="tag tag-teal">Source: {businessRaw.data_source ?? 'Analysis Engine'}</span></div>
            </div>
          </div>
        )}
      </div>
    </DataGuard>
  );
}
