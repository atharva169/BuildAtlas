// FILE: src/components/features/floorplan/FloorPlanPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import FloorPlanCanvas from './FloorPlanCanvas'
import Card, { Badge, Button } from '../../ui/Card'
import { CITY_OPTIONS, BHK_OPTIONS, QUALITY_OPTIONS } from '../../../utils/constants'
import { formatSqft } from '../../../utils/formatters'
import { Grid3X3 } from 'lucide-react'

export default function FloorPlanPage() {
  const { currentProject, setProject, floorPlan, setFloorPlan, isLoading, setLoading } = useProjectStore()
  const [localProject, setLocalProject] = useState({ ...currentProject })

  const fetchFloorPlan = async (proj) => {
    setLoading('floorPlan', true)
    const res = await api.generateFloorPlan(proj || localProject)
    if (res.success && res.data) { setFloorPlan(res.data); setProject(proj || localProject) }
    setLoading('floorPlan', false)
  }

  useEffect(() => { if (!floorPlan) fetchFloorPlan(currentProject) }, [])

  const update = (key, val) => setLocalProject(p => ({ ...p, [key]: val }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config Form */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-txt-1 mb-4 flex items-center gap-2"><Grid3X3 size={14} className="text-teal" /> Plot Configuration</h3>
          <div className="space-y-3">
            {[
              { label: 'Plot Length (ft)', key: 'plot_length_ft', type: 'number', min: 20, max: 200 },
              { label: 'Plot Width (ft)', key: 'plot_width_ft', type: 'number', min: 20, max: 200 },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">{f.label}</label>
                <input type={f.type} value={localProject[f.key]} onChange={e => update(f.key, Number(e.target.value))} min={f.min} max={f.max}
                  className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
              </div>
            ))}
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1 block">BHK Type</label>
              <div className="flex gap-2">
                {BHK_OPTIONS.map(b => (
                  <button key={b} onClick={() => update('bhk_type', b)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${localProject.bhk_type === b ? 'bg-teal/15 text-teal border border-teal/30' : 'bg-bg-4 text-txt-2 border border-bdr-1 hover:border-bdr-2'}`}>{b}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-txt-2">Vastu Compliant</span>
              <button onClick={() => update('vastu', !localProject.vastu)}
                className={`w-10 h-5 rounded-full transition-all duration-200 ${localProject.vastu ? 'bg-teal' : 'bg-bg-4 border border-bdr-1'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${localProject.vastu ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <Button onClick={() => fetchFloorPlan()} disabled={isLoading.floorPlan} className="w-full mt-2">
              {isLoading.floorPlan ? 'Generating...' : 'Generate Floor Plan'}
            </Button>
          </div>
          {/* Room Schedule */}
          {floorPlan?.rooms && (
            <div className="mt-4 border-t border-bdr-1 pt-3">
              <h4 className="text-[10px] text-txt-3 uppercase tracking-widest mb-2">Room Schedule</h4>
              <div className="space-y-1">
                {floorPlan.rooms.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-2">{r.label}</span>
                    <span className="font-mono text-txt-1">{Math.round(r.area_sqft)} sqft</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs font-semibold mt-2 pt-2 border-t border-bdr-1">
                  <span className="text-txt-1">Carpet Area</span>
                  <span className="font-mono text-teal">{formatSqft(floorPlan.carpet_area_sqft)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Canvas */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-txt-1">Generated Layout</h3>
            <div className="flex gap-2">
              {floorPlan?.vastu_applied && <Badge color="teal">Vastu ✓</Badge>}
              <Badge color="gray">{localProject.bhk_type}</Badge>
            </div>
          </div>
          {floorPlan ? (
            <FloorPlanCanvas rooms={floorPlan.rooms} plotLength={floorPlan.plot_length_ft} plotWidth={floorPlan.plot_width_ft}
              vastuApplied={floorPlan.vastu_applied} usableLength={floorPlan.usable_length} usableWidth={floorPlan.usable_width} />
          ) : (
            <div className="flex items-center justify-center h-64 text-txt-3 text-xs">Click "Generate Floor Plan" to see your layout</div>
          )}
          {floorPlan?.warnings?.length > 0 && (
            <div className="mt-3 space-y-1">
              {floorPlan.warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-amber flex items-center gap-1">⚠ {w}</p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
