import { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { PHASE_COLORS } from '../utils/helpers';
import { Timer, AlertTriangle } from 'lucide-react';

const PHASE_OPTIONS = [
  { id: 'approvals', name: 'Approvals & Permits' },
  { id: 'foundation', name: 'Foundation' },
  { id: 'structure', name: 'RCC Structure' },
  { id: 'masonry', name: 'Masonry' },
  { id: 'mep', name: 'MEP' },
  { id: 'finishing', name: 'Finishing' },
];

export default function DelayCascade() {
  const navigate = useNavigate();
  const { schedule, cascadeResult, predictCascade, projectInput } = useProjectStore();
  const [selectedPhase, setSelectedPhase] = useState('foundation');
  const [delayDays, setDelayDays] = useState(14);

  if (!schedule) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No schedule available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  const simulate = () => predictCascade(selectedPhase, delayDays);

  return (
    <div>
      <div className="page-header">
        <h1>Delay Cascade Predictor</h1>
        <p>Select a phase and delay duration — see how it ripples through the schedule</p>
      </div>

      {/* Controls */}
      <div className="glass-card animate-fade-up" style={{ padding: 24, marginBottom: 24 }}>
        <div className="grid-3" style={{ alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Delayed Phase
            </label>
            <select className="input-field" value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}>
              {PHASE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Delay Duration
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="range" min="7" max="60" value={delayDays}
                onChange={e => setDelayDays(Number(e.target.value))} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 50 }}>{delayDays}d</span>
            </div>
          </div>
          <button className="btn-primary" onClick={simulate}>
            <Timer size={18} /> Predict Cascade
          </button>
        </div>
      </div>

      {/* Results */}
      {cascadeResult && (
        <>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="glass-card stat-card animate-fade-up">
              <div className="stat-value">{cascadeResult.original_total_days}d → {cascadeResult.new_total_days}d</div>
              <div className="stat-label">Project Duration Impact</div>
              <div style={{ fontSize: '0.88rem', color: '#f43f5e', fontWeight: 600, marginTop: 4 }}>
                +{cascadeResult.new_total_days - cascadeResult.original_total_days} days total delay
              </div>
            </div>
            <div className="glass-card stat-card animate-fade-up">
              <div className="stat-value">{cascadeResult.affected_phases.length}</div>
              <div className="stat-label">Phases Affected</div>
            </div>
          </div>

          {/* Cascade visualization */}
          <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-amber)', marginRight: 8, display: 'inline' }} />
              Ripple Map
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cascadeResult.affected_phases.map(p => (
                <div key={p.phase_id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                  background: 'var(--bg-secondary)', borderRadius: 8,
                  borderLeft: `3px solid ${PHASE_COLORS[p.phase_id] || '#6366f1'}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.phase_name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Day {p.original_end} → Day {p.new_end}
                    </div>
                  </div>
                  <div style={{ color: '#f43f5e', fontWeight: 700, fontSize: '1rem' }}>
                    +{p.delay_days}d
                  </div>
                  {p.is_critical && <span className="badge badge-critical">Critical</span>}
                </div>
              ))}
            </div>
          </div>

          {/* AI mitigations */}
          {cascadeResult.mitigations && cascadeResult.mitigations.length > 0 && (
            <div className="glass-card animate-fade-up" style={{ padding: 24, marginTop: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>AI Mitigation Suggestions</h3>
              {cascadeResult.mitigations.map((m, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-default)', fontSize: '0.9rem' }}>
                  <strong>{m.phase_id}</strong>: {m.mitigation} (recover ~{m.recovery_days}d)
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
