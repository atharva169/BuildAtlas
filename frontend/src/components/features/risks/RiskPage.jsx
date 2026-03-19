// FILE: src/components/features/risks/RiskPage.jsx
// Standalone risk prediction engine — 5 weighted categories, probability + financial impact.
import React, { useEffect, useMemo, useState } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { getRiskColor, getRiskLabel, getRiskBg, formatLakhs } from '../../../utils/formatters'
import { estimateCostFrontend } from '../../../utils/calculations'
import Card, { Badge } from '../../ui/Card'
import { Shield, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { MONSOON_MONTHS } from '../../../utils/constants'

// Client-side risk scoring (mirrors backend, no LLM needed)
function computeRisks(project, p50) {
  const highCities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune']
  const slowCities = { 'Mumbai': 8.5, 'Delhi NCR': 7.8, 'Bengaluru': 7.0 }
  const monsoon = MONSOON_MONTHS[project.city] || []
  let overlapCount = 0
  for (let off = 0; off < 6; off++) {
    if (monsoon.includes(((project.start_month - 1 + off) % 12) + 1)) overlapCount++
  }

  const risks = [
    {
      risk_id: 'steel_price', category: 'Financial', title: 'Steel Price Volatility (Fe-500D TMT)',
      score: Math.min(10, (highCities.includes(project.city) ? 8.2 : 6.5) + (project.project_type === 'commercial' ? 0.8 : 0)),
      weight: 0.25, prob_pct: 72,
      financial_impact_lakhs: +(p50 * 0.42 * 0.38 * 0.15).toFixed(2),
      mitigation: 'Lock forward rate contract with TMT supplier by Month 2. Consider staggered procurement to average out price swings.',
    },
    {
      risk_id: 'labour_shortage', category: 'Workforce', title: 'Labour Shortage & Migration Risk',
      score: Math.min(10, ([9,10,11].includes(project.start_month) ? 7.1 : 4.5) + (['Ahmedabad','Kolkata'].includes(project.city) ? 1.2 : 0)),
      weight: 0.20, prob_pct: 55,
      financial_impact_lakhs: +(p50 * 0.10 * 0.20).toFixed(2),
      mitigation: 'Pre-book subcontractor crews 60 days before mobilisation. Offer weekly wage settlements to retain migrant labour.',
    },
    {
      risk_id: 'regulatory_delay', category: 'Regulatory', title: 'Plan Sanction & NOC Delays',
      score: Math.min(10, (slowCities[project.city] || 5.5) + (project.floors > 4 ? 1.0 : 0)),
      weight: 0.20, prob_pct: 65,
      financial_impact_lakhs: +(p50 * 0.03).toFixed(2),
      mitigation: 'Engage liaison officer for municipal approvals. File RERA registration in parallel with plan-sanction application.',
    },
    {
      risk_id: 'weather_monsoon', category: 'Weather', title: 'Monsoon Season Construction Disruption',
      score: Math.min(10, 3.0 + overlapCount * 1.5),
      weight: 0.20, prob_pct: monsoon.length > 0 ? 85 : 20,
      financial_impact_lakhs: +(overlapCount * 0.5).toFixed(2),
      mitigation: 'Schedule earthwork and foundation before monsoon onset. Install temporary drainage and dewatering on-site per IS 3764.',
    },
    {
      risk_id: 'supply_chain', category: 'Supply Chain', title: 'Material Availability & Logistics',
      score: Math.min(10, (['Kolkata','Ahmedabad'].includes(project.city) ? 6.8 : 4.2) + (['premium','luxury'].includes(project.quality) ? 1.5 : 0)),
      weight: 0.15, prob_pct: 40,
      financial_impact_lakhs: +(p50 * 0.02).toFixed(2),
      mitigation: 'Identify 2 alternate suppliers for key materials (cement, steel, sand). Maintain 15-day buffer stock on site.',
    },
  ]

  risks.forEach(r => {
    r.severity = r.score >= 7 ? 'critical' : r.score >= 4 ? 'medium' : 'low'
    r.score = +r.score.toFixed(1)
  })

  const overallScore = +(risks.reduce((s, r) => s + r.score * r.weight, 0) / risks.reduce((s, r) => s + r.weight, 0)).toFixed(1)
  return { risks, overallScore }
}

export default function RiskPage() {
  const { currentProject, risks: apiRisks, setRisks, isLoading, setLoading } = useProjectStore()
  const [expanded, setExpanded] = useState(null)

  const localCost = useMemo(() => estimateCostFrontend(currentProject), [currentProject])
  const localRisks = useMemo(() => computeRisks(currentProject, localCost.total?.p50 || 50), [currentProject, localCost])

  // Try API in background
  useEffect(() => {
    if (!apiRisks) {
      setLoading('risks', true)
      api.assessRisks(currentProject).then(res => {
        if (res.success && res.data) setRisks(res.data)
        setLoading('risks', false)
      })
    }
  }, [])

  const display = apiRisks?.risks || localRisks.risks
  const overall = apiRisks?.overall_score || localRisks.overallScore
  const totalImpact = display.reduce((s, r) => s + (r.financial_impact_lakhs || 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-txt-1 flex items-center gap-2">
            <Shield size={20} className="text-teal" /> Risk Prediction Engine
          </h2>
          <p className="text-xs text-txt-3 mt-1">Weighted scoring across 5 categories — flags project-killers with probability and financial impact</p>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card glow>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Overall Risk</p>
          <p className="text-2xl font-bold font-mono" style={{ color: getRiskColor(overall) }}>{overall}/10</p>
          <Badge color={overall >= 7 ? 'red' : overall >= 4 ? 'amber' : 'green'}>{getRiskLabel(overall)}</Badge>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Critical Risks</p>
          <p className="text-2xl font-bold font-mono text-red">{display.filter(r => r.severity === 'critical').length}</p>
          <p className="text-[10px] text-txt-3">of {display.length} total</p>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Max Financial Impact</p>
          <p className="text-2xl font-bold font-mono text-amber">{formatLakhs(totalImpact)}</p>
          <p className="text-[10px] text-txt-3">combined worst-case</p>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Project Status</p>
          <p className="text-xl font-bold text-txt-1">{currentProject.project_name}</p>
          <p className="text-[10px] text-txt-3">{currentProject.city} · {currentProject.floors}F</p>
        </Card>
      </div>

      {/* Risk score bar visualisation */}
      <Card>
        <h3 className="text-sm font-semibold text-txt-1 mb-4">Risk Factor Scores</h3>
        <div className="space-y-4">
          {display.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: getRiskColor(r.score) }} />
                  <span className="text-xs text-txt-1 font-medium">{r.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={r.severity === 'critical' ? 'red' : r.severity === 'medium' ? 'amber' : 'green'}>{r.severity}</Badge>
                  <span className="text-sm font-mono font-bold" style={{ color: getRiskColor(r.score) }}>{r.score}</span>
                </div>
              </div>
              <div className="h-2 bg-bg-4 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${r.score * 10}%`, background: getRiskColor(r.score) }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Risk Cards */}
      <div className="space-y-3">
        {display.map((r, i) => (
          <div key={i} className="bg-bg-2 border border-bdr-1 rounded-xl overflow-hidden transition-all">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-bg-3/30 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: getRiskBg(r.score) }}>
                <AlertTriangle size={14} style={{ color: getRiskColor(r.score) }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-txt-1">{r.title}</p>
                <p className="text-[10px] text-txt-3">{r.category} · Weight: {(r.weight * 100).toFixed(0)}%</p>
              </div>
              <div className="text-right mr-2">
                <p className="text-sm font-mono font-bold" style={{ color: getRiskColor(r.score) }}>{r.score}/10</p>
                {r.prob_pct && <p className="text-[10px] text-txt-3">{r.prob_pct}% prob.</p>}
              </div>
              {expanded === i ? <ChevronUp size={14} className="text-txt-3" /> : <ChevronDown size={14} className="text-txt-3" />}
            </button>
            {expanded === i && (
              <div className="px-4 pb-4 pt-1 border-t border-bdr-1/50">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-bg-3 rounded-lg p-2.5">
                    <p className="text-[9px] text-txt-3 uppercase">Financial Impact</p>
                    <p className="text-sm font-mono font-semibold text-amber">{formatLakhs(r.financial_impact_lakhs)}</p>
                  </div>
                  <div className="bg-bg-3 rounded-lg p-2.5">
                    <p className="text-[9px] text-txt-3 uppercase">Probability</p>
                    <p className="text-sm font-mono font-semibold text-txt-1">{r.prob_pct || '—'}%</p>
                  </div>
                </div>
                <div className="bg-bg-3 rounded-lg p-3">
                  <p className="text-[9px] text-txt-3 uppercase mb-1">Mitigation Strategy</p>
                  <p className="text-xs text-txt-2 leading-relaxed">{r.mitigation}</p>
                </div>
                {r.ai_narrative && (
                  <div className="mt-2 bg-teal/5 rounded-lg p-3 border border-teal/10">
                    <p className="text-[9px] text-teal uppercase mb-1">AI Analysis</p>
                    <p className="text-xs text-txt-2 leading-relaxed">{r.ai_narrative}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
