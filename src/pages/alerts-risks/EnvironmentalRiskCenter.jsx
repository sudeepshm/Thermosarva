import { CloudSun, Thermometer, Sun, Droplets, Wind, SunMedium } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataGuard } from '../../components/PageLoader';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ICON_MAP = { Thermometer, Sun, Droplets, Wind, CloudSun, SunMedium };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{payload[0]?.payload?.subject}</div>
      <div className="tt-row"><div className="tt-dot" style={{ background: '#f97316' }} />Risk Score: {payload[0]?.value}</div>
    </div>
  );
};

function RiskGauge({ score }) {
  const angle = -90 + (score / 100) * 180;
  const toRad = d => (d * Math.PI) / 180;
  const needleX = 80 + 55 * Math.cos(toRad(angle));
  const needleY = 80 + 55 * Math.sin(toRad(angle));
  return (
    <div className="risk-meter">
      <div className="risk-gauge-wrap" style={{ width: 180, height: 100 }}>
        <svg width="180" height="100" className="risk-gauge-arc">
          <path d="M 20 90 A 60 60 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 90 A 60 60 0 0 1 80 30" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          <path d="M 80 30 A 60 60 0 0 1 130 45" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          <path d="M 130 45 A 60 60 0 0 1 160 90" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          <line x1="90" y1="90" x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="90" r="5" fill="white" />
        </svg>
        <div className="risk-score-label">
          <div className="risk-score-value" style={{ color: score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e' }}>{score}</div>
          <div className="risk-score-sub">Risk Score</div>
        </div>
      </div>
    </div>
  );
}

export default function EnvironmentalRiskCenter() {
  const { dashboardData, loading, error } = useApp();
  const riskRaw = dashboardData?.risk?.environment ?? {};
  const current = dashboardData?.thermal?.current ?? {};
  const safety = dashboardData?.safety ?? {};

  // Derive overall risk score from safety categories
  const crewCat = safety.crew?.category ?? 'NORMAL';
  const coldCat = safety.cold_storage?.external_thermal_pressure ?? 'NORMAL_EXTERNAL_LOAD';
  const foodCat = safety.food?.environmental_exposure_category ?? 'LOW_ENVIRONMENTAL_EXPOSURE';

  const catScore = { NORMAL: 20, CAUTION: 45, HIGH_HEAT: 70, CRITICAL: 95, NORMAL_EXTERNAL_LOAD: 20, ELEVATED_COOLING_DEMAND: 55, HIGH_THERMAL_PRESSURE: 85, LOW_ENVIRONMENTAL_EXPOSURE: 20, ELEVATED_ENVIRONMENTAL_EXPOSURE: 55, HIGH_ENVIRONMENTAL_EXPOSURE: 85 };
  const riskScore = riskRaw?.risk_score ?? Math.round((catScore[crewCat] + catScore[coldCat] + catScore[foodCat]) / 3);
  const overallRisk = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MODERATE' : 'LOW';

  // Build radar data from safety categories
  const radarData = [
    { subject: 'Crew Safety', score: catScore[crewCat] ?? 20 },
    { subject: 'Cold Storage', score: catScore[coldCat] ?? 20 },
    { subject: 'Food Safety', score: catScore[foodCat] ?? 20 },
    { subject: 'Heat Index', score: Math.min(100, Math.round((current?.heat_index_c ?? 0) * 2.2)) },
    { subject: 'AQI', score: Math.min(100, Math.round((current?.aqi ?? 0) / 2)) },
  ];

  // Build conditions list from current env params
  const conditions = [
    { label: 'Temperature', value: current?.temperature_c != null ? `${Math.round(current.temperature_c)}°C` : '--', status: current?.temperature_c > 38 ? 'critical' : current?.temperature_c > 32 ? 'warning' : 'ok', icon: 'Thermometer' },
    { label: 'Heat Index', value: current?.heat_index_c != null ? `${Math.round(current.heat_index_c)}°C` : '--', status: current?.heat_index_c > 43 ? 'critical' : current?.heat_index_c > 35 ? 'warning' : 'ok', icon: 'Sun' },
    { label: 'AQI', value: current?.aqi != null ? `${current.aqi}` : '--', status: current?.aqi > 150 ? 'critical' : current?.aqi > 100 ? 'warning' : 'ok', icon: 'Wind' },
    { label: 'Humidity', value: current?.humidity_pct != null ? `${Math.round(current.humidity_pct)}%` : '--', status: current?.humidity_pct > 85 ? 'warning' : 'ok', icon: 'Droplets' },
    { label: 'UV Index', value: current?.uv_index != null ? `${current.uv_index}` : '--', status: current?.uv_index > 8 ? 'critical' : current?.uv_index > 5 ? 'warning' : 'ok', icon: 'SunMedium' },
  ];

  return (
    <DataGuard loading={loading} error={error} data={dashboardData}>
      <div className="page-scroll">
        <div className="page-header">
          <div className="page-header-row">
            <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
              <CloudSun size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h1 className="page-title">Environmental Risk Center</h1>
              <p className="page-desc">
                Consolidated risk view — environmental conditions, crew health, cold storage, and food safety in one dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Overall risk + gauge */}
        <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.05))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
          <RiskGauge score={riskScore} />
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Overall Risk Level</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: riskScore >= 70 ? 'var(--status-critical)' : riskScore >= 40 ? 'var(--status-warning)' : 'var(--status-ok)' }}>{overallRisk}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>Risk score {riskScore}/100 derived from crew, storage, and food safety assessments.</div>
          </div>
        </div>

        <div className="two-col">
          {/* Conditions */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Current Environmental Conditions</span></div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {conditions.map(cond => {
                  const Icon = ICON_MAP[cond.icon] || Thermometer;
                  return (
                    <div key={cond.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: `1px solid ${cond.status === 'critical' ? 'rgba(239,68,68,0.3)' : cond.status === 'warning' ? 'rgba(245,158,11,0.25)' : 'var(--border-subtle)'}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cond.status === 'critical' ? 'var(--status-critical-dim)' : cond.status === 'warning' ? 'var(--status-warning-dim)' : 'var(--status-ok-dim)', color: cond.status === 'critical' ? 'var(--status-critical)' : cond.status === 'warning' ? 'var(--status-warning)' : 'var(--status-ok)', flexShrink: 0 }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cond.label}</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cond.value}</div>
                      </div>
                      <span className={`tag tag-${cond.status === 'critical' ? 'red' : cond.status === 'warning' ? 'yellow' : 'green'}`}>
                        {cond.status === 'critical' ? 'Critical' : cond.status === 'warning' ? 'Caution' : 'OK'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="panel">
            <div className="panel-header"><span className="panel-title">Risk by Area</span></div>
            <div className="panel-body">
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {radarData.map(area => (
                  <div key={area.subject} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{area.subject}</span>
                    <div className="progress-bar" style={{ flex: 2, maxWidth: 140 }}>
                      <div className="progress-fill" style={{ width: `${area.score}%`, background: area.score >= 75 ? '#ef4444' : area.score >= 55 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                    <span style={{ fontWeight: 700, width: 32, textAlign: 'right', fontSize: '0.82rem', color: area.score >= 75 ? '#ef4444' : area.score >= 55 ? '#f59e0b' : '#22c55e' }}>{area.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataGuard>
  );
}
