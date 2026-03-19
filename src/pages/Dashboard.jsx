import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { formatCurrency, formatNumber, CATEGORY_COLORS } from '../utils/helpers';
import {
  IndianRupee, CalendarDays, ShieldAlert, Grid3x3, Users, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projectInput, costEstimate, schedule, riskRegister, floorPlan, resources, compliance } =
    useProjectStore();

  if (!costEstimate) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>No project analyzed yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Start by entering your project details on the home page.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <Grid3x3 size={18} /> New Project
        </button>
      </div>
    );
  }

  const cards = [
    {
      icon: IndianRupee, label: 'Estimated Cost (P50)',
      value: formatCurrency(costEstimate.total_p50),
      sub: `₹${formatNumber(costEstimate.cost_per_sqft)}/sqft`,
      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
      link: '/cost',
    },
    {
      icon: CalendarDays, label: 'Project Duration',
      value: `${schedule.total_duration_days} days`,
      sub: `${Math.ceil(schedule.total_duration_days / 30)} months · ${schedule.monsoon_lockout_days}d monsoon buffer`,
      color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      link: '/schedule',
    },
    {
      icon: ShieldAlert, label: 'Risk Score',
      value: `${riskRegister.overall_score}/10`,
      sub: `Top: ${riskRegister.top_risk}`,
      color: riskRegister.overall_score >= 5 ? '#f43f5e' : '#f59e0b',
      bg: riskRegister.overall_score >= 5 ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
      link: '/risk',
    },
    {
      icon: Users, label: 'Peak Workers',
      value: resources.peak_workers,
      sub: `${formatNumber(resources.total_mandays)} total mandays`,
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
      link: '/resources',
    },
  ];

  return (
    <div>
      <div className="page-header animate-fade-up">
        <h1>Dashboard — {projectInput?.project_name || 'Project Analysis'}</h1>
        <p>
          {projectInput?.bhk_config} {projectInput?.building_type} ·{' '}
          {projectInput?.plot_width_ft}×{projectInput?.plot_depth_ft} ft ·{' '}
          G+{(projectInput?.num_floors || 1) - 1} ·{' '}
          {projectInput?.city?.charAt(0).toUpperCase()}{projectInput?.city?.slice(1)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        {cards.map((card) => (
          <div key={card.label} className="glass-card stat-card animate-fade-up"
            onClick={() => navigate(card.link)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: card.bg }}>
              <card.icon size={22} style={{ color: card.color }} />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Cost breakdown + Risk */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
            Cost Confidence Band
          </h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'P10 (Best)', value: costEstimate.total_p10, color: '#10b981' },
              { label: 'P50 (Expected)', value: costEstimate.total_p50, color: '#3b82f6' },
              { label: 'P90 (Worst)', value: costEstimate.total_p90, color: '#f43f5e' },
            ].map(b => (
              <div key={b.label} style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: b.color }}>{formatCurrency(b.value)}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Primary driver: <strong style={{ color: 'var(--accent-amber)' }}>{costEstimate.primary_variance_driver}</strong>
          </div>
        </div>

        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} style={{ color: 'var(--accent-amber)' }} />
            Top Risks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {riskRegister.risks.slice(0, 4).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                <span className={`badge badge-${r.severity}`}>{r.severity}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{r.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Score: {r.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance + Floor Plan summary */}
      <div className="grid-2">
        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
            Compliance ({compliance?.items.length || 0} items)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {compliance?.items.slice(0, 4).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-default)', fontSize: '0.88rem' }}>
                <span>{c.regulation}</span>
                <span style={{ color: 'var(--text-muted)' }}>{c.avg_tat_days}d TAT</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Grid3x3 size={18} style={{ color: 'var(--accent-cyan)' }} />
            Floor Plan Summary
          </h3>
          <div className="grid-2">
            <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rooms</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{floorPlan?.rooms.length || 0}</div>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carpet Area</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatNumber(floorPlan?.carpet_area || 0)} sqft</div>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Built-up Area</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatNumber(floorPlan?.total_built_area || 0)} sqft</div>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plot</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{floorPlan?.plot_width}×{floorPlan?.plot_depth}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
