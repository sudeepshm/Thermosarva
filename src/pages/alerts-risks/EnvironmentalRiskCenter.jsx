import { CloudSun, Thermometer, Sun, Droplets, Wind, SunMedium } from 'lucide-react';
import { environmentalRiskData } from '../../data/mockData';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const ICON_MAP = { Thermometer, Sun, Droplets, Wind, CloudSun, SunMedium };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tt-label">{payload[0]?.payload?.subject}</div>
      <div className="tt-row">
        <div className="tt-dot" style={{ background: '#f97316' }} />
        Risk Score: {payload[0]?.value}
      </div>
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
          {/* Background arc */}
          <path d="M 20 90 A 60 60 0 0 1 160 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          {/* Green zone */}
          <path d="M 20 90 A 60 60 0 0 1 80 30" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          {/* Yellow zone */}
          <path d="M 80 30 A 60 60 0 0 1 130 45" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          {/* Red zone */}
          <path d="M 130 45 A 60 60 0 0 1 160 90" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
          {/* Needle */}
          <line x1="90" y1="90" x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="90" r="5" fill="white" />
        </svg>
        <div className="risk-score-label">
          <div className="risk-score-value" style={{
            color: score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e'
          }}>{score}</div>
          <div className="risk-score-sub">Risk Score</div>
        </div>
      </div>
    </div>
  );
}

const radarData = environmentalRiskData.riskAreas.map(a => ({
  subject: a.name,
  score: a.score,
}));

export default function EnvironmentalRiskCenter() {
  return (
    <div className="page-scroll">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-icon-wrap" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <CloudSun size={24} color="var(--brand-primary)" />
          </div>
          <div>
            <h1 className="page-title">Environmental Risk Center</h1>
            <p className="page-desc">
              Your consolidated risk view — environmental conditions, crew health, cold storage, and food safety in one dashboard.
            </p>
          </div>
        </div>
        <div className="dependency-trail">
          <span className="dep-step">Heat Conditions</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Crew Safety</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Cold Storage</span>
          <span className="dep-arrow">+</span>
          <span className="dep-step">Food Safety</span>
          <span className="dep-arrow">→</span>
          <span className="dep-step current">Environmental Risk Center</span>
        </div>
      </div>

      {/* Overall risk + gauge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.05))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 20,
      }}>
        <RiskGauge score={environmentalRiskData.riskScore} />
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Overall Risk Level
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'var(--status-critical)' }}>
            {environmentalRiskData.overallRisk}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Risk score {environmentalRiskData.riskScore}/100. Immediate attention required on 2 fronts.
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Environmental Conditions */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Current Environmental Conditions</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {environmentalRiskData.conditions.map(cond => {
                const Icon = ICON_MAP[cond.icon] || Thermometer;
                return (
                  <div key={cond.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${cond.status === 'critical' ? 'rgba(239,68,68,0.3)' : cond.status === 'warning' ? 'rgba(245,158,11,0.25)' : 'var(--border-subtle)'}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: cond.status === 'critical' ? 'var(--status-critical-dim)' : cond.status === 'warning' ? 'var(--status-warning-dim)' : 'var(--status-ok-dim)',
                      color: cond.status === 'critical' ? 'var(--status-critical)' : cond.status === 'warning' ? 'var(--status-warning)' : 'var(--status-ok)',
                      flexShrink: 0,
                    }}>
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

        {/* Risk Radar by Area */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Risk by Area</span>
          </div>
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
              {environmentalRiskData.riskAreas.map(area => (
                <div key={area.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{area.name}</span>
                  <div className="progress-bar" style={{ flex: 2, maxWidth: 140 }}>
                    <div className="progress-fill" style={{
                      width: `${area.score}%`,
                      background: area.score >= 75 ? '#ef4444' : area.score >= 55 ? '#f59e0b' : '#22c55e'
                    }} />
                  </div>
                  <span style={{
                    fontWeight: 700, width: 32, textAlign: 'right', fontSize: '0.82rem',
                    color: area.score >= 75 ? '#ef4444' : area.score >= 55 ? '#f59e0b' : '#22c55e'
                  }}>{area.score}</span>
                  <span style={{ fontSize: '0.68rem', color: area.trend === 'worsening' ? '#ef4444' : 'var(--text-muted)' }}>
                    {area.trend === 'worsening' ? '↑' : '→'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
