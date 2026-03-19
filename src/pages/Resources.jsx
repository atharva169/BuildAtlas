import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { formatNumber, PHASE_COLORS } from '../utils/helpers';
import { Users, Wrench, Package } from 'lucide-react';

export default function Resources() {
  const navigate = useNavigate();
  const resources = useProjectStore(s => s.resources);

  if (!resources) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No resource plan available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Resource Allocation</h1>
        <p>Crew composition, equipment, and materials by phase · Peak: {resources.peak_workers} workers</p>
      </div>

      <div className="grid-3 stagger" style={{ marginBottom: 28 }}>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
            <Users size={22} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-value">{resources.peak_workers}</div>
          <div className="stat-label">Peak Workers</div>
        </div>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Users size={22} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-value">{formatNumber(resources.total_mandays)}</div>
          <div className="stat-label">Total Mandays</div>
        </div>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Wrench size={22} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">{resources.equipment_list.length}</div>
          <div className="stat-label">Equipment Types</div>
        </div>
      </div>

      {/* Per-phase breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {resources.crew_plan.map(phase => (
          <div key={phase.phase_id} className="glass-card animate-fade-up" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: PHASE_COLORS[phase.phase_id] || '#6366f1' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, flex: 1 }}>{phase.phase_name}</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{phase.duration_days} days</span>
            </div>

            <div className="grid-3" style={{ gap: 12 }}>
              {/* Workers */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Users size={14} /> Crew
                </div>
                {Object.entries(phase.workers).length > 0 ? (
                  Object.entries(phase.workers).map(([role, count]) => (
                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.88rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  ))
                ) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>N/A</span>}
              </div>

              {/* Equipment */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Wrench size={14} /> Equipment
                </div>
                {phase.equipment.map((eq, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', padding: '2px 0' }}>{eq}</div>
                ))}
                {phase.equipment.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None</span>}
              </div>

              {/* Materials */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Package size={14} /> Key Materials
                </div>
                {phase.materials_needed.map((mat, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', padding: '2px 0' }}>{mat}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
