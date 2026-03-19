// FILE: src/components/features/cascade/DelayCascadePage.jsx
// Standalone delay cascade predictor — drag any phase delay on the Gantt,
// entire downstream schedule recalculates live via DAG forward-pass.
import React, { useState, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { generateScheduleFrontend, calculateCascadeFrontend } from '../../../utils/calculations'
import { formatDate, getPhaseColor, formatWeeks, formatLakhs } from '../../../utils/formatters'
import Card, { Badge } from '../../ui/Card'
import { AlertTriangle, Clock, ArrowRight, Zap, ArrowDown } from 'lucide-react'

export default function DelayCascadePage() {
  const { currentProject, schedule } = useProjectStore()
  const localSched = useMemo(() => generateScheduleFrontend(currentProject), [currentProject])
  const sched = schedule || localSched
  const phases = sched.phases || []

  const [delayedIdx, setDelayedIdx] = useState(0)
  const [delayWeeks, setDelayWeeks] = useState(3)

  const cascade = useMemo(() =>
    phases.length > 0 ? calculateCascadeFrontend(phases, delayedIdx, delayWeeks) : null,
    [phases, delayedIdx, delayWeeks]
  )

  const mitigations = {
    0: 'Deploy additional excavation equipment (JCB + Poclain). Consider nightshift for earthwork. Change from open to machine-cut excavation per IS 3764.',
    1: 'Pre-fabricate steel cages off-site to save RCC time. Use ready-mix concrete (RMC) instead of site-batching. Add one extra crane for formwork lifting.',
    2: 'Switch from conventional plastering to machine spray plaster. Use AAC blocks (faster laying rate) per IS 2185. Pre-order all masonry materials.',
    3: 'Run electrical and plumbing rough-in in parallel using separate contractors. Pre-wire conduits during superstructure phase itself.',
    4: 'Prioritise wet areas first (bathroom, kitchen tiling). Overlap painting with fittings installation. Deploy 2× finishing crew.',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-txt-1 flex items-center gap-2">
          <Zap size={20} className="text-amber" /> Delay Cascade Predictor
        </h2>
        <p className="text-xs text-txt-3 mt-1">Select a phase and set delay weeks — see the entire downstream schedule recalculate live via DAG forward-pass</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-txt-1 mb-3">Trigger Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Phase to Delay</label>
              <div className="space-y-1">
                {phases.map((p, i) => (
                  <button key={i} onClick={() => setDelayedIdx(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${delayedIdx === i ? 'bg-amber/10 text-amber border border-amber/30' : 'text-txt-2 hover:bg-bg-3 border border-transparent'}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: getPhaseColor(i) }} />
                    <span className="flex-1 text-left">{p.name}</span>
                    <span className="font-mono text-[10px] text-txt-3">{p.adjusted_weeks}wk</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-txt-2">Delay Duration</span>
                <span className="font-mono text-amber font-bold text-base">{delayWeeks} weeks</span>
              </div>
              <input type="range" min={1} max={8} value={delayWeeks} onChange={e => setDelayWeeks(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-bg-4 cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-amber/20 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-0" />
              <div className="flex justify-between text-[9px] text-txt-3 mt-1">
                {[1,2,3,4,5,6,7,8].map(w => <span key={w} className={w === delayWeeks ? 'text-amber font-bold' : ''}>{w}w</span>)}
              </div>
            </div>
          </div>
        </Card>

        {/* Impact Summary */}
        {cascade && (
          <div className="space-y-3">
            <Card glow>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center">
                  <Clock size={18} className="text-red" />
                </div>
                <div>
                  <p className="text-[10px] text-txt-3 uppercase">New Project End Date</p>
                  <p className="text-xl font-bold font-mono text-red">{formatDate(cascade.new_project_end)}</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-txt-3">Was: <span className="font-mono text-txt-2">{formatDate(cascade.original_project_end)}</span></span>
                <span className="text-red font-mono">+{cascade.total_delay_days} days total</span>
              </div>
            </Card>
            <Card>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-txt-3 uppercase">Cost Impact</p>
                  <p className="text-lg font-bold font-mono text-red">+{formatLakhs(cascade.cost_impact_lakhs)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-txt-3 uppercase">Blocked Phases</p>
                  <p className="text-lg font-bold font-mono text-amber">{cascade.affected_phases.filter(p => p.status === 'BLOCKED').length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Ripple Map — Visual cascade */}
      {cascade && (
        <Card>
          <h3 className="text-sm font-semibold text-txt-1 mb-4">Ripple Map</h3>
          <div className="space-y-1">
            {cascade.affected_phases.map((ap, i) => {
              const bgColor = ap.status === 'BLOCKED' ? 'bg-red/10 border-red/20' : ap.status === 'PARTIAL' ? 'bg-amber/10 border-amber/20' : 'bg-bg-3 border-bdr-1'
              const statusColor = ap.status === 'BLOCKED' ? 'text-red' : ap.status === 'PARTIAL' ? 'text-amber' : 'text-green'
              const isTriggered = i === delayedIdx

              return (
                <div key={i}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${bgColor} ${isTriggered ? 'ring-1 ring-amber/40' : ''}`}>
                    <span className="w-3 h-3 rounded-full" style={{ background: getPhaseColor(i) }} />
                    <span className="text-xs text-txt-1 font-medium flex-1">{ap.name}</span>
                    <Badge color={ap.status === 'BLOCKED' ? 'red' : ap.status === 'PARTIAL' ? 'amber' : 'green'}>
                      {ap.status}
                    </Badge>
                    <span className={`text-xs font-mono font-semibold ${ap.delay_days > 0 ? 'text-red' : 'text-txt-3'}`}>
                      {ap.delay_days > 0 ? `+${ap.delay_days}d` : '—'}
                    </span>
                    <span className="text-[10px] font-mono text-txt-3 w-24 text-right">{formatDate(ap.new_end)}</span>
                  </div>
                  {i < cascade.affected_phases.length - 1 && ap.delay_days > 0 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown size={12} className="text-red/40" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Mitigation Recommendation */}
      {cascade && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber" />
            <h3 className="text-sm font-semibold text-txt-1">Mitigation Recommendation</h3>
          </div>
          <p className="text-xs text-txt-2 leading-relaxed">
            {mitigations[delayedIdx] || 'Prioritise critical path activities. Deploy additional crew to absorb delay. Consider parallel execution of non-dependent phases.'}
          </p>
          <div className="mt-3 p-3 bg-bg-3 rounded-lg text-[10px] text-txt-3">
            💡 A {delayWeeks}-week delay in "{phases[delayedIdx]?.name}" cascades to {cascade.affected_phases.filter(p => p.delay_days > 0).length} downstream phases,
            pushing the project end by {cascade.total_delay_days} days with an estimated cost impact of +{formatLakhs(cascade.cost_impact_lakhs)}.
          </div>
        </Card>
      )}
    </div>
  )
}
