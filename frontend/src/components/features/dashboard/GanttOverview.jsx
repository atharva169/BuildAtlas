// FILE: src/components/features/dashboard/GanttOverview.jsx
import React from 'react'
import { formatDate, getPhaseColor } from '../../../utils/formatters'

export default function GanttOverview({ phases }) {
  if (!phases || phases.length === 0) return <p className="text-xs text-txt-3 py-4">No schedule data</p>

  // Calculate time range
  const allDates = phases.flatMap(p => [new Date(p.start_date), new Date(p.end_date)])
  const minDate = new Date(Math.min(...allDates))
  const maxDate = new Date(Math.max(...allDates))
  const totalDays = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24))

  // Generate month labels
  const months = []
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  while (cursor <= maxDate) {
    months.push(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: Math.max(400, months.length * 50) }}>
        {/* Month Grid Headers */}
        <div className="flex border-b border-bdr-1 mb-2">
          <div className="w-[140px] shrink-0" />
          <div className="flex-1 flex">
            {months.map((m, i) => {
              const isMonsoon = [6, 7, 8, 9].includes(m.getMonth() + 1)
              return (
                <div key={i} className={`flex-1 text-center text-[9px] py-1 ${isMonsoon ? 'bg-red/8 text-red' : 'text-txt-3'}`}>
                  {m.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase Bars */}
        {phases.map((phase, i) => {
          const start = new Date(phase.start_date)
          const end = new Date(phase.end_date)
          const leftPct = ((start - minDate) / (1000 * 60 * 60 * 24) / totalDays) * 100
          const widthPct = ((end - start) / (1000 * 60 * 60 * 24) / totalDays) * 100

          return (
            <div key={i} className="flex items-center mb-1.5 group" data-tooltip={`${formatDate(phase.start_date)} → ${formatDate(phase.end_date)} · ${phase.adjusted_weeks}wk`}>
              <div className="w-[140px] shrink-0 pr-3">
                <p className="text-[10px] text-txt-2 truncate">{phase.name}</p>
              </div>
              <div className="flex-1 relative h-6">
                <div className="absolute top-0.5 rounded-md h-5 flex items-center px-2 transition-all duration-300 hover:brightness-125 cursor-pointer"
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%`, background: getPhaseColor(i), opacity: 0.85 }}>
                  {widthPct > 12 && <span className="text-[9px] text-white font-medium truncate">{phase.adjusted_weeks}wk</span>}
                </div>
                {phase.is_critical && (
                  <div className="absolute top-0 left-0 h-full pointer-events-none" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                    <div className="h-px bg-red/50 mt-0" />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-bdr-1">
          <span className="text-[9px] text-txt-3 flex items-center gap-1"><span className="w-2 h-2 rounded bg-red/30" /> Monsoon</span>
          <span className="text-[9px] text-txt-3 flex items-center gap-1"><span className="w-2 h-0.5 bg-red/50" /> Critical Path</span>
        </div>
      </div>
    </div>
  )
}
