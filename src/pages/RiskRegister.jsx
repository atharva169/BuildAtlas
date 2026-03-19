import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

export default function RiskRegister() {
  const navigate = useNavigate();
  const { riskRegister, compliance } = useProjectStore();

  if (!riskRegister) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No risk assessment available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Risk Register & Compliance</h1>
        <p>Overall risk score: {riskRegister.overall_score}/10 · Top risk: {riskRegister.top_risk}</p>
      </div>

      {/* Risk cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {riskRegister.risks.map(risk => (
          <div key={risk.id} className="glass-card animate-fade-up" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  background: risk.severity === 'critical' ? 'rgba(244,63,94,0.15)' :
                    risk.severity === 'high' ? 'rgba(249,115,22,0.15)' :
                    risk.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700,
                    color: risk.severity === 'critical' ? '#fb7185' :
                      risk.severity === 'high' ? '#fb923c' :
                      risk.severity === 'medium' ? '#fbbf24' : '#34d399',
                  }}>{risk.score}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{risk.title}</h3>
                  <span className={`badge badge-${risk.severity}`}>{risk.severity}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {risk.category} · P={risk.probability} · Impact={risk.impact}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {risk.narrative || risk.default_narrative}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance */}
      {compliance && (
        <>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
            Compliance Tracker
          </h2>
          <div style={{ marginBottom: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Authority: <strong>{compliance.state_authority}</strong> · {compliance.state_notes}
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Regulation</th>
                  <th>Authority</th>
                  <th>TAT (days)</th>
                  <th>Documents Required</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {compliance.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.regulation}</td>
                    <td>{item.authority}</td>
                    <td>
                      <span style={{
                        color: item.avg_tat_days > 40 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        fontWeight: 600
                      }}>
                        {item.avg_tat_days}d
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {item.required_docs.join(', ')}
                    </td>
                    <td><span className="badge badge-medium">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
