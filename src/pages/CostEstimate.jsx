import { useProjectStore } from '../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber, CATEGORY_COLORS } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';

export default function CostEstimate() {
  const navigate = useNavigate();
  const costEstimate = useProjectStore(s => s.costEstimate);

  if (!costEstimate) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>No cost estimate available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Analyze a project first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>New Project</button>
      </div>
    );
  }

  const chartData = Object.entries(costEstimate.cost_by_category).map(([cat, val]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: val,
    color: CATEGORY_COLORS[cat] || '#6366f1',
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Cost Estimate</h1>
        <p>BOQ breakdown with P10/P50/P90 confidence bands · ₹{formatNumber(costEstimate.cost_per_sqft)}/sqft</p>
      </div>

      {/* Summary cards */}
      <div className="grid-3 stagger" style={{ marginBottom: 28 }}>
        {[
          { label: 'P10 (Optimistic)', value: costEstimate.total_p10, color: '#10b981', icon: TrendingUp },
          { label: 'P50 (Expected)', value: costEstimate.total_p50, color: '#3b82f6', icon: IndianRupee },
          { label: 'P90 (Conservative)', value: costEstimate.total_p90, color: '#f43f5e', icon: AlertTriangle },
        ].map(c => (
          <div key={c.label} className="glass-card stat-card animate-fade-up">
            <div className="stat-icon" style={{ background: c.color + '20' }}>
              <c.icon size={22} style={{ color: c.color }} />
            </div>
            <div className="stat-value" style={{ color: c.color }}>{formatCurrency(c.value)}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Cost by category chart */}
      <div className="glass-card animate-fade-up" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Cost by Category</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tickFormatter={v => formatCurrency(v)} stroke="#64748b" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
            <Tooltip
              formatter={v => formatCurrency(v)}
              contentStyle={{ background: '#1a2235', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* BOQ Table */}
      <div className="glass-card animate-fade-up" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Bill of Quantities</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate (₹)</th>
                <th>P10</th>
                <th>P50</th>
                <th>P90</th>
              </tr>
            </thead>
            <tbody>
              {costEstimate.boq.map((item, i) => (
                <tr key={i}>
                  <td>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: 2,
                      background: CATEGORY_COLORS[item.category] || '#6366f1',
                      marginRight: 8
                    }} />
                    {item.category}
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.item}</td>
                  <td>{formatNumber(item.quantity)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                  <td>₹{formatNumber(item.city_rate)}</td>
                  <td style={{ color: '#10b981' }}>₹{formatNumber(item.p10_cost)}</td>
                  <td style={{ fontWeight: 600 }}>₹{formatNumber(item.p50_cost)}</td>
                  <td style={{ color: '#f43f5e' }}>₹{formatNumber(item.p90_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
