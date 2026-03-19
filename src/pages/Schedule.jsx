import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { PHASE_COLORS } from '../utils/helpers';
import { CalendarDays, CloudRain, AlertTriangle } from 'lucide-react';

export default function Schedule() {
  const navigate = useNavigate();
  const schedule = useProjectStore(s => s.schedule);

  if (!schedule) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No schedule generated</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  const total = schedule.total_duration_days;

  return (
    <div>
      <div className="page-header">
        <h1>Construction Schedule</h1>
        <p>CPM-based Gantt · {total} days ({Math.ceil(total/30)} months) · {schedule.monsoon_lockout_days}d monsoon buffer</p>
      </div>

      {/* Summary */}
      <div className="grid-3 stagger" style={{ marginBottom: 28 }}>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CalendarDays size={22} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">{total} days</div>
          <div className="stat-label">Total Duration</div>
        </div>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <CloudRain size={22} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-value">{schedule.monsoon_lockout_days}d</div>
          <div className="stat-label">Monsoon Buffer</div>
        </div>
        <div className="glass-card stat-card animate-fade-up">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value">{schedule.approval_wait_days}d</div>
          <div className="stat-label">Approval Wait</div>
        </div>
      </div>

      {/* Gantt */}
      <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Gantt Chart</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedule.phases.map(phase => {
            const pct_start = (phase.start_day / total) * 100;
            const pct_width = Math.max(3, (phase.duration_days / total) * 100);
            const color = PHASE_COLORS[phase.id] || '#6366f1';

            return (
              <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 180, flexShrink: 0, fontSize: '0.88rem', fontWeight: 500, textAlign: 'right' }}>
                  {phase.name}
                </div>
                <div style={{ flex: 1, position: 'relative', height: 36, background: 'var(--bg-secondary)', borderRadius: 6 }}>
                  <div className={`gantt-bar ${phase.is_critical ? 'critical' : ''}`}
                    style={{
                      position: 'absolute', left: `${pct_start}%`, width: `${pct_width}%`,
                      background: phase.monsoon_buffered
                        ? `repeating-linear-gradient(45deg, ${color}, ${color} 4px, ${color}99 4px, ${color}99 8px)`
                        : color,
                      top: 2, height: 32,
                    }}>
                    <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {phase.duration_days}d
                    </span>
                  </div>
                </div>
                <div style={{ width: 70, flexShrink: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Day {phase.start_day}–{phase.end_day}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline axis */}
        <div style={{ display: 'flex', marginLeft: 196, marginTop: 10, justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Day 0</span>
          <span>Day {Math.floor(total/4)}</span>
          <span>Day {Math.floor(total/2)}</span>
          <span>Day {Math.floor(total*3/4)}</span>
          <span>Day {total}</span>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>▓ Monsoon-buffered phase</span>
          <span style={{ color: 'var(--accent-amber)' }}>▸ Critical path (all phases are sequential)</span>
        </div>
      </div>
    </div>
  );
}
