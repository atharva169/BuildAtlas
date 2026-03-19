import { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { SlidersHorizontal, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function Sandbox() {
  const navigate = useNavigate();
  const { costEstimate, schedule, simulateWhatIf, whatIfDeltas } = useProjectStore();
  const [params, setParams] = useState({
    steel_price_delta_pct: 0,
    cement_price_delta_pct: 0,
    labour_rate_delta_pct: 0,
    timeline_compression_pct: 0,
    monsoon_extension_weeks: 0,
  });

  useEffect(() => {
    if (costEstimate) {
      const timer = setTimeout(() => simulateWhatIf(params), 300);
      return () => clearTimeout(timer);
    }
  }, [params, costEstimate]);

  if (!costEstimate) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No analysis to simulate</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  const sliders = [
    { key: 'steel_price_delta_pct', label: 'Steel Price Change', min: -30, max: 50, unit: '%', color: '#3b82f6' },
    { key: 'cement_price_delta_pct', label: 'Cement Price Change', min: -20, max: 30, unit: '%', color: '#10b981' },
    { key: 'labour_rate_delta_pct', label: 'Labour Rate Change', min: -20, max: 40, unit: '%', color: '#8b5cf6' },
    { key: 'timeline_compression_pct', label: 'Timeline Compression', min: 0, max: 30, unit: '%', color: '#f59e0b' },
    { key: 'monsoon_extension_weeks', label: 'Monsoon Extension', min: 0, max: 8, unit: 'wk', color: '#06b6d4' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>What-If Sandbox</h1>
        <p>Adjust parameters and see instant cost/schedule/risk deltas</p>
      </div>

      <div className="grid-2">
        {/* Sliders */}
        <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
            <SlidersHorizontal size={18} style={{ marginRight: 8, display: 'inline' }} />
            Parameters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sliders.map(s => (
              <div key={s.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: s.color }}>
                    {params[s.key] > 0 ? '+' : ''}{params[s.key]}{s.unit}
                  </span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.key === 'monsoon_extension_weeks' ? 1 : 5}
                  value={params[s.key]}
                  onChange={e => setParams({ ...params, [s.key]: Number(e.target.value) })}
                  style={{ accentColor: s.color }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-secondary" style={{ width: '100%', marginTop: 16 }}
            onClick={() => setParams({
              steel_price_delta_pct: 0, cement_price_delta_pct: 0,
              labour_rate_delta_pct: 0, timeline_compression_pct: 0,
              monsoon_extension_weeks: 0,
            })}>
            Reset All
          </button>
        </div>

        {/* Results */}
        <div>
          {whatIfDeltas && (
            <>
              <div className="grid-2 stagger" style={{ marginBottom: 16 }}>
                <div className="glass-card stat-card animate-fade-up">
                  <div className="stat-icon" style={{ background: whatIfDeltas.cost_delta >= 0 ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)' }}>
                    {whatIfDeltas.cost_delta >= 0 ? <TrendingUp size={22} style={{ color: '#f43f5e' }} /> : <TrendingDown size={22} style={{ color: '#10b981' }} />}
                  </div>
                  <div className="stat-value">{formatCurrency(whatIfDeltas.new_cost)}</div>
                  <div className="stat-label">New Cost</div>
                  <div style={{ fontSize: '0.82rem', color: whatIfDeltas.cost_delta >= 0 ? '#f43f5e' : '#10b981', fontWeight: 600, marginTop: 4 }}>
                    {whatIfDeltas.cost_delta >= 0 ? '+' : ''}{formatCurrency(whatIfDeltas.cost_delta)} ({whatIfDeltas.cost_delta_pct > 0 ? '+' : ''}{whatIfDeltas.cost_delta_pct}%)
                  </div>
                </div>

                <div className="glass-card stat-card animate-fade-up">
                  <div className="stat-icon" style={{ background: whatIfDeltas.days_delta > 0 ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)' }}>
                    <AlertTriangle size={22} style={{ color: whatIfDeltas.days_delta > 0 ? '#f43f5e' : '#10b981' }} />
                  </div>
                  <div className="stat-value">{whatIfDeltas.new_days}d</div>
                  <div className="stat-label">New Duration</div>
                  <div style={{ fontSize: '0.82rem', color: whatIfDeltas.days_delta > 0 ? '#f43f5e' : '#10b981', fontWeight: 600, marginTop: 4 }}>
                    {whatIfDeltas.days_delta > 0 ? '+' : ''}{whatIfDeltas.days_delta} days
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="glass-card animate-fade-up" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Impact Breakdown</h3>
                {whatIfDeltas.breakdown.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Adjust sliders to see impact</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {whatIfDeltas.breakdown.map((b, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8,
                      }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{b.factor}</span>
                        <span style={{
                          fontSize: '0.88rem', fontWeight: 700,
                          color: b.cost_impact >= 0 ? '#f43f5e' : '#10b981',
                        }}>
                          {b.cost_impact >= 0 ? '+' : ''}{formatCurrency(b.cost_impact)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {whatIfDeltas.risk_delta > 0 && (
                <div className="glass-card animate-fade-up" style={{ padding: 16, marginTop: 16, borderLeft: '3px solid var(--accent-rose)' }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    ⚠ Risk score increased by {whatIfDeltas.risk_delta.toFixed(1)} points
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
