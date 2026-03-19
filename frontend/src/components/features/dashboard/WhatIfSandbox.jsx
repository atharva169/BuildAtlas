// FILE: src/components/features/dashboard/WhatIfSandbox.jsx
import React, { useState, useMemo } from 'react'
import { calculateWhatIfFrontend } from '../../../utils/calculations'
import { formatLakhs } from '../../../utils/formatters'
import Card, { Badge } from '../../ui/Card'
import { SlidersHorizontal } from 'lucide-react'

function SliderRow({ label, value, onChange, min, max, unit, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-txt-2">{label}</span>
        <span className="font-mono text-txt-1" style={{ color: value !== 0 ? color : undefined }}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={1} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-bdr-1 rounded-full appearance-none cursor-pointer outline-none transition-all
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125
          [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-teal 
          [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125" />
    </div>
  )
}

export default function WhatIfSandbox({ baseCost }) {
  const [steel, setSteel] = useState(0)
  const [labour, setLabour] = useState(0)
  const [weeks, setWeeks] = useState(0)

  const result = useMemo(() => calculateWhatIfFrontend(baseCost, steel, labour, weeks), [baseCost, steel, labour, weeks])

  const deltaColor = result.delta_lakhs > 0 ? 'var(--red)' : result.delta_lakhs < 0 ? 'var(--green)' : 'var(--txt-2)'

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-txt-1 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-teal" /> What-If Sandbox
        </h3>
        <Badge color={result.delta_lakhs > 0 ? 'red' : result.delta_lakhs < 0 ? 'green' : 'gray'}>
          {result.delta_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.delta_lakhs))} ({result.delta_pct > 0 ? '+' : ''}{result.delta_pct}%)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-5">
          <SliderRow label="Steel Price (Fe-500D)" value={steel} onChange={setSteel} min={-20} max={30} unit="%" color="var(--amber)" />
          <SliderRow label="Labour Rate" value={labour} onChange={setLabour} min={-10} max={25} unit="%" color="var(--violet)" />
          <SliderRow label="Timeline Shift" value={weeks} onChange={setWeeks} min={-4} max={8} unit=" wks" color="var(--blue)" />
          <button onClick={() => { setSteel(0); setLabour(0); setWeeks(0) }}
            className="text-[10px] text-txt-3 hover:text-teal transition-colors">Reset sliders</button>
        </div>

        {/* Results */}
        <div className="bg-bg-3 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-txt-3">Original P50</span>
            <span className="text-sm font-mono text-txt-2">{formatLakhs(result.original_p50_lakhs)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-txt-1 font-medium">New P50</span>
            <span className="text-xl font-bold font-mono animate-number" style={{ color: deltaColor }}>{formatLakhs(result.new_p50_lakhs)}</span>
          </div>
          <div className="h-px bg-bdr-1 my-2" />
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-txt-3">Steel impact</span><span className="font-mono text-txt-2">{result.steel_impact_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.steel_impact_lakhs))}</span></div>
            <div className="flex justify-between"><span className="text-txt-3">Labour impact</span><span className="font-mono text-txt-2">{result.labour_impact_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.labour_impact_lakhs))}</span></div>
            <div className="flex justify-between"><span className="text-txt-3">Time impact</span><span className="font-mono text-txt-2">{result.time_impact_lakhs > 0 ? '+' : ''}{formatLakhs(Math.abs(result.time_impact_lakhs))}</span></div>
          </div>
        </div>
      </div>
    </Card>
  )
}
