import { CalendarRange, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-row">
          <div className="tt-dot" style={{ background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function OperatingWindowPlanner() {
  const { dashboardData, loading, error } = useApp();
  const windowRaw = dashboardData?.operations?.window ?? {};

  // Derive from backend data or use sensible defaults
  const recommended = windowRaw?.recommended_window ?? { start: '07:00', end: '11:00', label: 'Morning Window' };
  const avoidWindow = windowRaw?.avoid_window ?? {};
  const secondary = windowRaw?.secondary_window ?? { start: '17:00', end: '19:30', label: 'Evening Window' };
  const timeline = windowRaw?.timeline ?? [];
  const peakBusiness = windowRaw?.peak_business ?? recommended.start + ' – ' + recommended.end;

  return (
  <DataGuard loading={loading} error={error} data={dashboardData}>
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(45,212,191,0.12)' }}>
            <CalendarRange size={24} color="var(--brand-teal)" />
          </div>
          <div>
            <h1 className="page-title">Operating Window Planner</h1>
            <p className="page-desc">
              Find your optimal service windows by balancing business demand with crew safety and thermal comfort.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Selected Location</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">12-Hour Heat Outlook</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Solar Exposure</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Operating Window Planner</span>
        </div>
      </div>

      {/* Recommended windows */}
      <div className="three-col mb-20">
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          textAlign: 'center',
        }}>
          <CheckCircle size={20} color="var(--status-ok)" style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--status-ok)' }}>
            {recommended.label ?? 'Best Window'}
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: 4 }}>
            {recommended.start} – {recommended.end}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Best business + safety balance
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          textAlign: 'center',
        }}>
          <XCircle size={20} color="var(--status-critical)" style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--status-critical)' }}>
            {avoidWindow.label ?? 'Peak Heat'}
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: 4 }}>
            {avoidWindow.start ?? '11:30'} – {avoidWindow.end ?? '16:30'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Heat index above 45°C
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          textAlign: 'center',
        }}>
          <AlertCircle size={20} color="var(--status-info)" style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--status-info)' }}>
            {secondary.label ?? 'Secondary Window'}
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: 4 }}>
            {secondary.start} – {secondary.end}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Good conditions returning
          </div>
        </div>
      </div>

      {/* Composite score chart */}
      <div className="panel mb-20">
        <div className="panel-header">
          <span className="panel-title">Composite Operating Score — Business × Safety</span>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.73rem' }}>
            {[
              { color: '#f97316', label: 'Business Demand' },
              { color: '#22c55e', label: 'Safety Score' },
              { color: '#2dd4bf', label: 'Composite' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 2, background: i.color, borderRadius: 2 }} />
                {i.label}
              </div>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="chart-container-tall">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline.length > 0 ? timeline : [{hour:'6AM',business:30,safety:90,composite:55},{hour:'8AM',business:75,safety:80,composite:77},{hour:'10AM',business:85,safety:60,composite:70},{hour:'12PM',business:65,safety:30,composite:40},{hour:'2PM',business:50,safety:20,composite:28},{hour:'4PM',business:55,safety:35,composite:42},{hour:'6PM',business:70,safety:65,composite:68}]} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradComposite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="rgba(45,212,191,0.3)" strokeDasharray="4 4" label={{ value: 'Good threshold', fill: '#2dd4bf', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" label={{ value: 'Avoid threshold', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="business" name="Business Demand" fill="#f97316" fillOpacity={0.3} radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="safety" name="Safety Score" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="composite" name="Composite" stroke="#2dd4bf" strokeWidth={2.5} fill="url(#gradComposite)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Today's Plan Summary</span>
        </div>
        <div className="panel-body">
          <div className="op-window-band">
            <div className="op-time-row">
              <span className="op-label">Morning Window</span>
              <div className="op-bar-track">
                <div className="op-bar-fill good" style={{ width: '25%' }}>7:30–11:00 AM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-ok)' }}>Recommended</span>
            </div>
            <div className="op-time-row">
              <span className="op-label">Peak Heat</span>
              <div className="op-bar-track">
                <div className="op-bar-fill avoid" style={{ width: '38%', marginLeft: '24%' }}>11:30 AM – 4:30 PM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-critical)' }}>Avoid</span>
            </div>
            <div className="op-time-row">
              <span className="op-label">Evening Window</span>
              <div className="op-bar-track">
                <div className="op-bar-fill secondary" style={{ width: '20%', marginLeft: '73%' }}>5–7:30 PM</div>
              </div>
              <span className="op-time-label" style={{ color: 'var(--status-info)' }}>Secondary</span>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Peak Business:</strong> {peakBusiness}</div>
          </div>
        </div>
      </div>
    </div>
  </DataGuard>
  );
}
