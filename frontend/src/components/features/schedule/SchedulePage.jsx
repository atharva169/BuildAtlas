// FILE: src/components/features/schedule/SchedulePage.jsx
import React, { useMemo, useState } from 'react'
import useProjectStore from '../../../store/projectStore'
import { generateScheduleFrontend, calculateCascadeFrontend } from '../../../utils/calculations'
import { formatDate, getPhaseColor, formatWeeks } from '../../../utils/formatters'
import Card, { Badge, Button } from '../../ui/Card'
import GanttOverview from '../dashboard/GanttOverview'
import { CalendarDays, AlertTriangle } from 'lucide-react'

function DelaySimulator({ phases }) {
  const [delayedIdx, setDelayedIdx] = useState(0)
  const [delayWeeks, setDelayWeeks] = useState(2)

  const cascade = useMemo(() => phases?.length ? calculateCascadeFrontend(phases, delayedIdx, delayWeeks) : null, [phases, delayedIdx, delayWeeks])

  if (!phases?.length) return null

  return (
    <Card>
      <h3 className="text-sm font-semibold text-txt-1 mb-4 flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber" /> Delay Cascade Simulator
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">Delayed Phase</label>
            <select value={delayedIdx} onChange={e => setDelayedIdx(Number(e.target.value))}
              className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2 text-xs text-txt-1 outline-none focus:border-teal/40">
              {phases.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-txt-2">Delay Duration</span>
              <span className="font-mono text-txt-1">{delayWeeks} weeks</span>
            </div>
            <input type="range" min={1} max={8} value={delayWeeks} onChange={e => setDelayWeeks(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-bg-4 cursor-pointer accent-amber
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber" />
          </div>
        </div>

        {cascade && (
          <div className="bg-bg-3 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-txt-3">New Project End</span>
              <span className="font-mono text-red font-semibold">{formatDate(cascade.new_project_end)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-txt-3">Total Delay</span>
              <span className="font-mono text-amber">{cascade.total_delay_days} days</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-txt-3">Cost Impact</span>
              <span className="font-mono text-red">+₹{cascade.cost_impact_lakhs}L</span>
            </div>
            <div className="h-px bg-bdr-1 my-1" />
            {cascade.affected_phases.map((ap, i) => (
              <div key={i} className={`flex items-center justify-between text-[10px] px-2 py-1 rounded
                ${ap.status === 'BLOCKED' ? 'bg-red/10 text-red' : ap.status === 'PARTIAL' ? 'bg-amber/10 text-amber' : 'text-txt-3'}`}>
                <span>{ap.name}</span>
                <span className="font-mono">{ap.delay_days > 0 ? `+${ap.delay_days}d` : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default function SchedulePage() {
  const { currentProject, schedule } = useProjectStore()
  const localSched = useMemo(() => generateScheduleFrontend(currentProject), [currentProject])
  const sched = schedule || localSched

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><p className="text-[10px] text-txt-3 uppercase tracking-widest">Total Duration</p><p className="text-lg font-bold text-txt-1 font-mono mt-1">{sched.total_months} mo</p></Card>
        <Card><p className="text-[10px] text-txt-3 uppercase tracking-widest">Start Date</p><p className="text-lg font-bold text-txt-1 font-mono mt-1">{formatDate(sched.project_start)}</p></Card>
        <Card><p className="text-[10px] text-txt-3 uppercase tracking-widest">Monsoon Buffer</p><p className="text-lg font-bold text-amber font-mono mt-1">{formatWeeks(sched.monsoon_lockout_weeks)}</p></Card>
        <Card><p className="text-[10px] text-txt-3 uppercase tracking-widest">Approval Wait</p><p className="text-lg font-bold text-violet font-mono mt-1">{formatWeeks(sched.approval_wait_weeks)}</p></Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-txt-1 mb-4">Full Schedule — Gantt View</h3>
        <GanttOverview phases={sched.phases} />
      </Card>

      {/* Phase Details Table */}
      <Card>
        <h3 className="text-sm font-semibold text-txt-1 mb-3">Phase Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-bdr-1">{['Phase','Base','Adjusted','Start','End','Critical','Monsoon'].map(h => <th key={h} className="text-left py-2 px-2 text-txt-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {sched.phases?.map((p, i) => (
                <tr key={i} className="border-b border-bdr-1/50 hover:bg-bg-3/50">
                  <td className="py-2 px-2 text-txt-1 flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: getPhaseColor(i) }} />{p.name}</td>
                  <td className="py-2 px-2 font-mono text-txt-2">{p.base_weeks}wk</td>
                  <td className="py-2 px-2 font-mono text-txt-1">{p.adjusted_weeks}wk</td>
                  <td className="py-2 px-2 font-mono text-txt-2">{formatDate(p.start_date)}</td>
                  <td className="py-2 px-2 font-mono text-txt-2">{formatDate(p.end_date)}</td>
                  <td className="py-2 px-2">{p.is_critical ? <Badge color="red">CRIT</Badge> : <span className="text-txt-3">—</span>}</td>
                  <td className="py-2 px-2">{p.monsoon_delay_weeks > 0 ? <Badge color="amber">+{p.monsoon_delay_weeks}wk</Badge> : <span className="text-txt-3">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DelaySimulator phases={sched.phases} />
    </div>
  )
}
