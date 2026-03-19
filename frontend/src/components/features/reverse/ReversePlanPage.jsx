// FILE: src/components/features/reverse/ReversePlanPage.jsx
import React, { useState, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { reversePlanFrontend } from '../../../utils/calculations'
import { formatLakhs, formatSqft } from '../../../utils/formatters'
import Card, { Badge, Button } from '../../ui/Card'
import { ArrowLeftRight, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { CITY_OPTIONS } from '../../../utils/constants'

export default function ReversePlanPage() {
  const { currentProject, setProject, isLoading, setLoading } = useProjectStore()
  const [budget, setBudget] = useState(currentProject.budget_lakhs || 100)
  const [deadline, setDeadline] = useState(currentProject.deadline_months || 18)
  const [city, setCity] = useState(currentProject.city)
  const [options, setOptions] = useState(null)
  const [aiRec, setAiRec] = useState(null)

  const localOptions = useMemo(() => reversePlanFrontend(budget, deadline, city, currentProject.project_type), [budget, deadline, city])

  const handleSolve = async () => {
    setLoading('reverse', true)
    const proj = { ...currentProject, budget_lakhs: budget, deadline_months: deadline, city }
    const res = await api.reversePlan(proj)
    if (res.success && res.data) {
      setOptions(res.data.options)
      setAiRec(res.data.ai_recommendation)
    } else {
      setOptions(localOptions)
    }
    setLoading('reverse', false)
  }

  const displayOptions = options || localOptions

  return (
    <div className="space-y-5">
      {/* Constraint Form */}
      <Card>
        <h3 className="text-sm font-semibold text-txt-1 mb-4 flex items-center gap-2"><ArrowLeftRight size={14} className="text-teal" /> Budget & Timeline Constraints</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">Budget (₹ Lakhs)</label>
            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} min={20} max={1000}
              className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
          </div>
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">Deadline (Months)</label>
            <input type="number" value={deadline} onChange={e => setDeadline(Number(e.target.value))} min={6} max={48}
              className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
          </div>
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">City</label>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2 text-xs text-txt-1 outline-none focus:border-teal/40">
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={handleSolve} disabled={isLoading.reverse} className="mt-4">
          {isLoading.reverse ? 'Solving...' : 'Find Feasible Options'}
        </Button>
      </Card>

      {/* Build Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayOptions?.map((opt, i) => {
          const isRecommended = i === 0 // highest value_score first
          return (
            <Card key={i} glow={isRecommended} className={isRecommended ? 'ring-1 ring-teal/20' : ''}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-txt-1">{opt.label}</h4>
                {isRecommended && <Badge color="teal"><Sparkles size={10} className="mr-0.5" /> AI Pick</Badge>}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs"><span className="text-txt-3">Feasible Area</span><span className="font-mono text-txt-1 font-semibold">{formatSqft(opt.feasible_sqft)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-txt-3">Budget Used</span><span className="font-mono text-txt-1">{formatLakhs(opt.estimated_cost_lakhs)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-txt-3">Timeline</span>
                  <span className={`font-mono font-semibold ${opt.timeline_feasible ? 'text-green' : 'text-red'}`}>
                    {opt.required_months} mo {opt.timeline_feasible ? '✓' : `(+${(opt.required_months - deadline).toFixed(0)} over)`}
                  </span>
                </div>
              </div>
              {/* Timeline Progress Bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-bg-4 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (deadline / opt.required_months) * 100)}%`, background: opt.timeline_feasible ? 'var(--green)' : 'var(--red)' }} />
                </div>
                <p className="text-[9px] text-txt-3 mt-1">Timeline fit: {Math.min(100, Math.round((deadline / opt.required_months) * 100))}%</p>
              </div>
              {/* What's included / cut */}
              <div className="space-y-1">
                {opt.what_gets_cut?.map((cut, j) => (
                  <p key={j} className="text-[10px] text-txt-3 flex items-center gap-1.5">
                    <XCircle size={10} className="text-red/50 shrink-0" /> {cut}
                  </p>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* AI Recommendation */}
      {aiRec && (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-teal" />
            <h3 className="text-sm font-semibold text-txt-1">AI Recommendation</h3>
          </div>
          <p className="text-xs text-txt-2 leading-relaxed">{aiRec}</p>
        </Card>
      )}
    </div>
  )
}
