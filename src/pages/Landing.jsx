import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { CITIES, STATES } from '../utils/helpers';
import { Sparkles, ArrowRight, Building2, Ruler, MapPin, Layers, Wallet } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const analyzeProject = useProjectStore(s => s.analyzeProject);
  const [form, setForm] = useState({
    project_name: '',
    building_type: 'residential',
    bhk_config: '2BHK',
    plot_width_ft: 40,
    plot_depth_ft: 60,
    num_floors: 2,
    city: 'bengaluru',
    state: 'karnataka',
    budget_inr: '',
    vastu_enabled: false,
  });

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    if (key === 'city') next.state = STATES[value] || 'karnataka';
    setForm(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = {
      ...form,
      plot_width_ft: Number(form.plot_width_ft),
      plot_depth_ft: Number(form.plot_depth_ft),
      num_floors: Number(form.num_floors),
      budget_inr: form.budget_inr ? Number(form.budget_inr) : null,
    };
    const ok = await analyzeProject(input);
    if (ok) navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(59,130,246,0.1)', padding: '6px 16px',
          borderRadius: 999, marginBottom: 16, fontSize: '0.8rem', color: 'var(--accent-blue)',
        }}>
          <Sparkles size={14} />
          GenAI-Powered Construction Intelligence
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
          Turn your <span className="gradient-text">plot dimensions</span> into
          <br />a complete construction plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          Floor layout → Cost breakdown → Schedule → Risk register → Compliance checklist
          <br />All in under 5 minutes. Built for Indian construction.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card animate-fade-up" style={{ padding: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Building2 size={20} style={{ color: 'var(--accent-blue)' }} />
          Project Details
        </h2>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Project Name
            </label>
            <input className="input-field" placeholder="e.g. Green Valley Villa"
              value={form.project_name} onChange={e => update('project_name', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Building Type
            </label>
            <select className="input-field" value={form.building_type}
              onChange={e => update('building_type', e.target.value)}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Ruler size={14} style={{ display: 'inline', marginRight: 4 }} /> Plot Width (ft)
            </label>
            <input className="input-field" type="number" min="15" max="200"
              value={form.plot_width_ft} onChange={e => update('plot_width_ft', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Plot Depth (ft)
            </label>
            <input className="input-field" type="number" min="15" max="200"
              value={form.plot_depth_ft} onChange={e => update('plot_depth_ft', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Layers size={14} style={{ display: 'inline', marginRight: 4 }} /> Floors
            </label>
            <select className="input-field" value={form.num_floors}
              onChange={e => update('num_floors', e.target.value)}>
              {[1,2,3,4].map(n => <option key={n} value={n}>G+{n-1} ({n} floor{n>1?'s':''})</option>)}
            </select>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              BHK Configuration
            </label>
            <select className="input-field" value={form.bhk_config}
              onChange={e => update('bhk_config', e.target.value)}>
              {['1BHK','2BHK','3BHK','4BHK','commercial_office'].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> City
            </label>
            <select className="input-field" value={form.city}
              onChange={e => update('city', e.target.value)}>
              {CITIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Wallet size={14} style={{ display: 'inline', marginRight: 4 }} /> Budget (₹, optional)
            </label>
            <input className="input-field" type="number" placeholder="e.g. 5000000"
              value={form.budget_inr} onChange={e => update('budget_inr', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <input type="checkbox" id="vastu" checked={form.vastu_enabled}
            onChange={e => update('vastu_enabled', e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }} />
          <label htmlFor="vastu" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Enable Vastu-compliant room placement
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 28px', fontSize: '1rem' }}>
          <Sparkles size={18} />
          Generate Complete Plan
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
