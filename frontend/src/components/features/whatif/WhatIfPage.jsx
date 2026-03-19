// FILE: src/components/features/whatif/WhatIfPage.jsx
// Standalone What-If Sandbox — sliders for steel, labour, timeline, cement.
// Instant delta on cost, end date, risk score. No LLM needed.
import React, { useState, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { estimateCostFrontend, calculateWhatIfFrontend, generateScheduleFrontend } from '../../../utils/calculations'
import { formatLakhs, formatDate } from '../../../utils/formatters'
import Card, { Badge, StatCard } from '../../ui/Card'
import { SlidersHorizontal, TrendingUp, TrendingDown, IndianRupee, CalendarDays, AlertTriangle } from 'lucide-react'

function AnimatedSlider({ label, value, onChange, min, max, unit, description, color }) {
  return (
    <div className="bg-bg-3 rounded-xl p-4 border border-bdr-1">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-medium text-txt-1">{label}</p>
          {description && <p className="text-[10px] text-txt-3 mt-0.5">{description}</p>}
        </div>
        <span className="text-lg font-mono font-bold animate-number" style={{ color: value !== 0 ? color : 'var(--txt-2)' }}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={1} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer transition-all hover:opacity-80"
        style={{ accentColor: color }} />
      <div className="flex justify-between text-[9px] text-txt-3 mt-1">
        <span>{min > 0 ? '+' : ''}{min}{unit}</span>
        <span>0{unit}</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  )
}

export default function WhatIfPage() {
  const { currentProject, costEstimate } = useProjectStore()
  const [steel, setSteel] = useState(0)
  const [labour, setLabour] = useState(0)
  const [timeline, setTimeline] = useState(0)
  const [cement, setCement] = useState(0)

  const localCost = useMemo(() => estimateCostFrontend(currentProject), [currentProject])
  const baseCost = costEstimate?.total?.p50 || localCost.total?.p50 || 0

  const result = useMemo(() => calculateWhatIfFrontend(baseCost, steel, labour, timeline, cement), [baseCost, steel, labour, timeline, cement])

  // Schedule impact (rough)
  const baseSchedule = useMemo(() => generateScheduleFrontend(currentProject), [currentProject])
  const newEndDate = useMemo(() => {
    if (timeline === 0) return baseSchedule.project_end
    const d = new Date(baseSchedule.project_end)
    d.setDate(d.getDate() + timeline * 7)
    return d.toISOString().split('T')[0]
  }, [baseSchedule, timeline])

  // Risk impact (simplified)
  const riskDelta = useMemo(() => {
    let delta = 0
    if (Math.abs(steel) > 10) delta += 0.5 * Math.sign(steel)
    if (Math.abs(labour) > 10) delta += 0.3 * Math.sign(labour)
    if (timeline > 4) delta += 0.8
    if (cement > 10) delta += 0.2
    return +delta.toFixed(1)
  }, [steel, labour, timeline, cement])

  const deltaColor = result.delta_lakhs > 0 ? 'var(--red)' : result.delta_lakhs < 0 ? 'var(--green)' : 'var(--txt-2)'
  const hasChanges = steel !== 0 || labour !== 0 || timeline !== 0 || cement !== 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-txt-1 flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-teal" /> What-If Sandbox
          </h2>
          <p className="text-xs text-txt-3 mt-1">Drag sliders to simulate price changes, timeline shifts, and see instant impact on cost, schedule, and risk.</p>
        </div>
        {hasChanges && (
          <button onClick={() => { setSteel(0); setLabour(0); setTimeline(0); setCement(0) }}
            className="text-xs px-3 py-1.5 rounded-lg bg-bg-3 text-txt-2 hover:text-teal border border-bdr-1 transition-colors">
            Reset All
          </button>
        )}
      </div>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card glow={result.delta_lakhs !== 0}>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Cost Impact</p>
          <p className="text-xl font-bold font-mono animate-number" style={{ color: deltaColor }}>
            {result.delta_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.delta_lakhs))}
          </p>
          <p className="text-[10px] text-txt-3 mt-1">
            {result.delta_pct > 0 ? '+' : ''}{result.delta_pct}% from P50
          </p>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">New P50</p>
          <p className="text-xl font-bold font-mono text-teal animate-number">{formatLakhs(result.new_p50_lakhs)}</p>
          <p className="text-[10px] text-txt-3 mt-1">was {formatLakhs(result.original_p50_lakhs)}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">End Date</p>
          <p className="text-xl font-bold font-mono animate-number" style={{ color: timeline > 0 ? 'var(--red)' : timeline < 0 ? 'var(--green)' : 'var(--txt-1)' }}>
            {formatDate(newEndDate)}
          </p>
          <p className="text-[10px] text-txt-3 mt-1">was {formatDate(baseSchedule.project_end)}</p>
        </Card>
        <Card>
          <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-1">Risk Shift</p>
          <p className="text-xl font-bold font-mono animate-number" style={{ color: riskDelta > 0 ? 'var(--red)' : riskDelta < 0 ? 'var(--green)' : 'var(--txt-1)' }}>
            {riskDelta > 0 ? '+' : ''}{riskDelta}
          </p>
          <p className="text-[10px] text-txt-3 mt-1">risk score delta</p>
        </Card>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatedSlider label="Steel Price (Fe-500D TMT)" value={steel} onChange={setSteel} min={-20} max={30} unit="%"
          description="TMT bar price change — 38% of structural cost" color="var(--amber)" />
        <AnimatedSlider label="Labour Rate" value={labour} onChange={setLabour} min={-10} max={25} unit="%"
          description="Daily wage adjustment for skilled/unskilled labour" color="var(--violet)" />
        <AnimatedSlider label="Timeline Compression" value={timeline} onChange={setTimeline} min={-4} max={8} unit=" wks"
          description="Schedule shift — negative = fast-track, positive = delay" color="var(--blue)" />
        <AnimatedSlider label="Cement Price (OPC 53)" value={cement} onChange={setCement} min={-15} max={20} unit="%"
          description="OPC/PPC cement price — 25% of civil cost" color="var(--red)" />
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-txt-1 mb-4">Impact Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Steel price impact', value: result.steel_impact_lakhs, icon: '🔩' },
            { label: 'Labour rate impact', value: result.labour_impact_lakhs, icon: '👷' },
            { label: 'Timeline cost impact', value: result.time_impact_lakhs, icon: '⏱️' },
            { label: 'Cement price impact', value: result.cement_impact_lakhs, icon: '🧱' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm">{item.icon}</span>
              <span className="text-xs text-txt-2 flex-1">{item.label}</span>
              <div className="w-40 h-1.5 bg-bg-4 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.abs(item.value) / (baseCost * 0.15) * 100)}%`,
                    background: item.value > 0 ? 'var(--red)' : item.value < 0 ? 'var(--green)' : 'var(--txt-3)',
                    marginLeft: item.value < 0 ? 'auto' : 0,
                  }} />
              </div>
              <span className="text-xs font-mono font-medium w-20 text-right" style={{ color: item.value > 0 ? 'var(--red)' : item.value < 0 ? 'var(--green)' : 'var(--txt-2)' }}>
                {item.value > 0 ? '+' : ''}{formatLakhs(Math.abs(item.value))}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-3 border-t border-bdr-1">
            <span className="text-sm">Σ</span>
            <span className="text-xs text-txt-1 font-semibold flex-1">Total Impact</span>
            <span className="text-sm font-mono font-bold" style={{ color: deltaColor }}>
              {result.delta_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.delta_lakhs))}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
