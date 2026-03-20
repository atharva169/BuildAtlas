// FILE: src/components/features/dashboard/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { estimateCostFrontend, generateScheduleFrontend } from '../../../utils/calculations'
import { formatLakhs, formatSqft, getRiskColor, getRiskLabel, getPhaseColor } from '../../../utils/formatters'
import Card, { StatCard, Badge } from '../../ui/Card'
import { IndianRupee, CalendarDays, AlertTriangle, Layers, TrendingUp, Shield } from 'lucide-react'
import WhatIfSandbox from './WhatIfSandbox'
import GanttOverview from './GanttOverview'
import ReportModal from './ReportModal'
import AiInsight from '../../ui/AiInsight'
import { DEMO_RISKS } from '../../../data/demoProject'
import { Sparkles } from 'lucide-react'

export default function Dashboard() {
  const { currentProject, costEstimate, setCostEstimate, schedule, setSchedule, risks, setRisks, setLoading, dataSource } = useProjectStore()
  const [showReport, setShowReport] = useState(false)

  // Compute frontend estimates as fallback only
  const localCost = useMemo(() => estimateCostFrontend(currentProject), [currentProject])
  const localSchedule = useMemo(() => generateScheduleFrontend(currentProject), [currentProject])
  const cost = costEstimate || localCost
  const sched = schedule || localSchedule
  const riskData = risks || DEMO_RISKS  // Always have risk data — never show "—"

  // Fire API calls in background — but skip if seed data is already loaded
  useEffect(() => {
    // If store already has data (from seed or previous API call), don't refetch
    if (costEstimate && schedule && risks) return

    async function fetchAll() {
      if (!costEstimate) {
        setLoading('cost', true)
        const cRes = await api.calculateEstimate(currentProject)
        if (cRes.success && cRes.data) setCostEstimate(cRes.data)
        setLoading('cost', false)
      }

      if (!schedule) {
        setLoading('schedule', true)
        const sRes = await api.generateSchedule(currentProject)
        if (sRes.success && sRes.data) setSchedule(sRes.data)
        setLoading('schedule', false)
      }

      if (!risks) {
        setLoading('risks', true)
        const rRes = await api.assessRisks(currentProject)
        if (rRes.success && rRes.data) setRisks(rRes.data)
        setLoading('risks', false)
      }
    }
    fetchAll()
  }, [])

  const topRisk = riskData?.risks?.[0]

  return (
    <div className="space-y-5">
      {/* Hero Row */}
      <div className="bg-bg-2 border border-bdr-1 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-txt-1">{currentProject.project_name}</h2>
            <Badge color="teal">{currentProject.bhk_type}</Badge>
          </div>
          <p className="text-xs text-txt-2 mb-3">{currentProject.city} · {currentProject.floors} floors · {formatSqft(currentProject.builtup_sqft)} · {currentProject.quality} grade</p>
          <div className="flex gap-6 text-xs text-txt-2">
            <span>Plot: {currentProject.plot_length_ft}×{currentProject.plot_width_ft} ft</span>
            <span>Start: {['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][currentProject.start_month]} {currentProject.start_year}</span>
            <span>{currentProject.vastu ? '✓ Vastu' : 'No Vastu'}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-[10px] text-txt-3 uppercase tracking-widest">Estimated Cost</p>
            <p className="text-2xl font-bold text-teal font-mono">{formatLakhs(cost.total?.p50)}</p>
            <p className="text-[10px] text-txt-3 mt-0.5 font-mono">{formatLakhs(cost.total?.p10)} – {formatLakhs(cost.total?.p90)}</p>
          </div>
          <button onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-[11px] font-semibold hover:bg-teal/25 transition-colors border border-teal/20">
            <Sparkles size={12} /> Generate AI Report
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="P50 Cost" value={formatLakhs(cost.total?.p50)} sub={`${cost.cost_per_sqft?.p50?.toLocaleString('en-IN')}/sqft`} icon={IndianRupee} />
        <StatCard label="Timeline" value={`${sched.total_months || '—'} months`} sub={`${sched.total_weeks || '—'} weeks total`} icon={CalendarDays} />
        <StatCard label="Risk Score" value={riskData.overall_score?.toFixed(1) || '—'} sub={topRisk ? getRiskLabel(topRisk.score) : '—'} icon={AlertTriangle} />
        <StatCard label="Quality" value={currentProject.quality} sub={`${currentProject.floors} floors`} icon={Layers} />
      </div>

      {/* Two-Column: Cost Breakdown + Gantt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BOQ Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-txt-1 flex items-center gap-2"><IndianRupee size={14} className="text-teal" /> Cost Breakdown</h3>
            <Badge color="gray">P50</Badge>
          </div>
          <div className="space-y-2">
            {cost.boq?.map((item, i) => {
              const colors = ['#3B82F6', '#8B5CF6', '#00C896', '#F59E0B', '#EF4444']
              const pct = item.percentage
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-txt-2">{item.category}</span>
                    <span className="text-txt-1 font-mono">{formatLakhs(item.amount_lakhs)}</span>
                  </div>
                  <div className="h-1.5 bg-bg-4 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: colors[i % 5] }} />
                  </div>
                </div>
              )
            })}
          </div>
          <AiInsight
            label="✨ AI Cost Insight"
            context={`Project: ${currentProject.project_name} in ${currentProject.city}, ${currentProject.floors} floors, ${currentProject.builtup_sqft} sqft, ${currentProject.quality} grade. P50 cost: ₹${cost.total?.p50}L, cost/sqft: ₹${cost.cost_per_sqft?.p50}. Variance driver: ${cost.variance_driver || 'steel prices'}. Give a practical cost insight.`}
          />
        </Card>

        {/* Gantt Overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-txt-1 flex items-center gap-2"><CalendarDays size={14} className="text-teal" /> Schedule Overview</h3>
            <Badge color={sched.monsoon_lockout_weeks > 0 ? 'amber' : 'green'}>
              {sched.monsoon_lockout_weeks > 0 ? `${sched.monsoon_lockout_weeks}wk monsoon` : 'No monsoon'}
            </Badge>
          </div>
          <GanttOverview phases={sched.phases || []} />
          <AiInsight
            label="✨ AI Schedule Insight"
            context={`Project in ${currentProject.city}, starting month ${currentProject.start_month}/${currentProject.start_year}. Total timeline: ${sched.total_months} months (${sched.total_weeks} weeks). Monsoon lockout: ${sched.monsoon_lockout_weeks} weeks. Approval wait: ${sched.approval_wait_weeks || 0} weeks. Give a practical scheduling insight about monsoon or timing.`}
          />
        </Card>
      </div>

      {/* What-If Sandbox */}
      <WhatIfSandbox baseCost={cost.total?.p50 || 0} />

      {/* Risk Register */}
      {riskData?.risks && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-txt-1 flex items-center gap-2"><Shield size={14} className="text-teal" /> Risk Register</h3>
            <span className="text-xs font-mono" style={{ color: getRiskColor(riskData.overall_score) }}>Overall: {riskData.overall_score?.toFixed(1)}/10</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskData.risks.map((r, i) => (
              <div key={i} className="bg-bg-3 rounded-lg p-3 border border-bdr-1">
                <div className="flex items-center justify-between mb-2">
                  <Badge color={r.severity === 'critical' ? 'red' : r.severity === 'medium' ? 'amber' : 'green'}>{r.severity}</Badge>
                  <span className="text-xs font-mono font-bold" style={{ color: getRiskColor(r.score) }}>{r.score}/10</span>
                </div>
                <h4 className="text-xs font-medium text-txt-1 mb-1">{r.title}</h4>
                <p className="text-[10px] text-txt-3 leading-relaxed">{r.mitigation}</p>
              </div>
            ))}
          </div>
          <AiInsight
            label="✨ AI Risk Insight"
            context={`Project in ${currentProject.city}, ${currentProject.floors} floors, ${currentProject.quality} grade. Overall risk: ${riskData.overall_score}/10. Top risk: ${riskData.risks?.[0]?.title} (${riskData.risks?.[0]?.score}/10). Give a practical risk mitigation insight for Indian construction.`}
          />
        </Card>
      )}

      {/* AI Report Modal */}
      <ReportModal open={showReport} onClose={() => setShowReport(false)} />
    </div>
  )
}
