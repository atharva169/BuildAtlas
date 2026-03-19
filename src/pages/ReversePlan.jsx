import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { ArrowLeftRight, Gem, Star, Crown } from 'lucide-react';

const TIER_ICONS = { economy: Gem, standard: Star, premium: Crown };
const TIER_COLORS = { economy: '#10b981', standard: '#3b82f6', premium: '#f59e0b' };

export default function ReversePlan() {
  const navigate = useNavigate();
  const { projectInput, reversePlan, loadReversePlan } = useProjectStore();

  useEffect(() => {
    if (projectInput && !reversePlan) loadReversePlan();
  }, [projectInput]);

  if (!projectInput) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No project data</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reverse Planning</h1>
        <p>Enter a budget → get 3 feasible build configurations</p>
      </div>

      {reversePlan && (
        <>
          {/* Feasibility notes */}
          {reversePlan.feasibility_notes.map((note, i) => (
            <div key={i} className="glass-card animate-fade-up" style={{ padding: '12px 20px', marginBottom: 12, fontSize: '0.88rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-blue)' }}>
              {note}
            </div>
          ))}

          {/* Config cards */}
          <div className="grid-3 stagger" style={{ marginTop: 20 }}>
            {reversePlan.configs.map(config => {
              const Icon = TIER_ICONS[config.tier];
              const color = TIER_COLORS[config.tier];

              return (
                <div key={config.tier} className="glass-card animate-fade-up" style={{
                  padding: 24,
                  borderTop: `3px solid ${color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Icon size={24} style={{ color }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {config.tier}
                    </h3>
                  </div>

                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color, marginBottom: 4 }}>
                    {formatCurrency(config.estimated_cost)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    {config.area_sqft} sqft · G+{config.num_floors-1} · {config.timeline_months} months
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    What you get
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.trade_offs.map((t, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
