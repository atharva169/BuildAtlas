import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, TrendingDown, TrendingUp, Shield } from 'lucide-react';

export default function MaterialSwap() {
  const navigate = useNavigate();
  const { projectInput, materialSwaps, loadMaterialSwaps } = useProjectStore();

  useEffect(() => {
    if (projectInput && !materialSwaps) loadMaterialSwaps();
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

  const swaps = materialSwaps?.swaps || [];

  return (
    <div>
      <div className="page-header">
        <h1>Material Swap Intelligence</h1>
        <p>Interactive substitution matrix with IS-code compliance and cost/time/strength deltas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {swaps.map((swap, i) => (
          <div key={i} className="glass-card animate-fade-up" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>
                {swap.original_name}
              </span>
              <ArrowRight size={20} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ background: 'rgba(59,130,246,0.12)', padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                {swap.replacement_name}
              </span>
            </div>

            {/* Deltas */}
            <div className="grid-4" style={{ marginBottom: 16, gap: 12 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: swap.cost_delta_pct <= 0 ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {swap.cost_delta_pct <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                  {swap.cost_delta_pct > 0 ? '+' : ''}{swap.cost_delta_pct}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: swap.time_delta_pct <= 0 ? '#10b981' : '#f43f5e' }}>
                  {swap.time_delta_pct > 0 ? '+' : ''}{swap.time_delta_pct}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Weight Reduction</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>
                  {swap.weight_reduction_pct}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Strength</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {swap.strength.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* IS Code + Notes */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <Shield size={14} /> {swap.original_is_code} → {swap.replacement_is_code}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {swap.reasoning || swap.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
