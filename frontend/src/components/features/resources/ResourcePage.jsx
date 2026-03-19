// FILE: src/components/features/resources/ResourcePage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import useProjectStore from '../../../store/projectStore'
import { api } from '../../../services/api'
import { formatLakhs, formatRupees } from '../../../utils/formatters'
import Card, { StatCard, Badge } from '../../ui/Card'
import { Users, Wrench, IndianRupee, TrendingUp } from 'lucide-react'

export default function ResourcePage() {
  const { currentProject, resources, setResources, isLoading, setLoading } = useProjectStore()

  useEffect(() => {
    if (!resources) {
      setLoading('resources', true)
      api.generateResources(currentProject).then(res => {
        if (res.success && res.data) setResources(res.data)
        setLoading('resources', false)
      })
    }
  }, [])

  const [activePhase, setActivePhase] = useState(0)
  const activeResource = resources?.resources?.[activePhase]

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Peak Workforce" value={resources?.peak_workforce || '—'} icon={Users} sub="at any phase" />
        <StatCard label="Total Labour Days" value={resources?.total_labour_days?.toLocaleString('en-IN') || '—'} icon={TrendingUp} sub="across all phases" />
        <StatCard label="Labour Cost" value={formatLakhs(resources?.total_labour_cost_lakhs)} icon={IndianRupee} sub="total estimate" />
        <StatCard label="Phases" value={resources?.resources?.length || '—'} icon={Wrench} sub="with crew data" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Phase Tabs */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-txt-1 mb-3">Construction Phases</h3>
          <div className="space-y-1">
            {resources?.resources?.map((r, i) => (
              <button key={i} onClick={() => setActivePhase(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${activePhase === i ? 'bg-teal/10 text-teal border-l-2 border-teal' : 'text-txt-2 hover:bg-bg-3 border-l-2 border-transparent'}`}>
                {r.phase_name}
              </button>
            ))}
          </div>
        </Card>

        {/* Crew + Equipment */}
        <div className="lg:col-span-2 space-y-4">
          {activeResource && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-txt-1">{activeResource.phase_name} — Crew</h3>
                  <Badge color="teal">{formatRupees(activeResource.daily_labour_cost)}/day</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(activeResource.crew).map(([role, count]) => (
                    <div key={role} className="bg-bg-3 rounded-lg p-3 text-center border border-bdr-1">
                      <p className="text-lg font-bold text-txt-1 font-mono">{count}</p>
                      <p className="text-[10px] text-txt-3 uppercase tracking-widest capitalize">{role.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-txt-1 mb-3 flex items-center gap-2"><Wrench size={14} className="text-teal" /> Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {activeResource.equipment.map((eq, i) => (
                    <span key={i} className="px-3 py-1.5 bg-bg-3 border border-bdr-1 rounded-lg text-xs text-txt-2">{eq}</span>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
