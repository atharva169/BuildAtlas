// FILE: src/components/features/project/NewProjectModal.jsx
import React, { useState } from 'react'
import useProjectStore from '../../../store/projectStore'
import { CITY_OPTIONS, BHK_OPTIONS, QUALITY_OPTIONS } from '../../../utils/constants'
import { Button } from '../../ui/Card'
import { X, Building2 } from 'lucide-react'

export default function NewProjectModal({ onClose }) {
  const { setProject, setFloorPlan, setCostEstimate, setSchedule, setRisks, setResources, setActivePage } = useProjectStore()

  const [form, setForm] = useState({
    project_name: '',
    city: 'Bengaluru',
    project_type: 'residential',
    floors: 2,
    plot_length_ft: 40,
    plot_width_ft: 60,
    builtup_sqft: 3600,
    quality: 'standard',
    vastu: true,
    start_month: 1,
    start_year: 2025,
    soil_type: 'medium',
    bhk_type: '2BHK',
    budget_lakhs: 80,
    deadline_months: 18,
  })

  const update = (key, val) => setForm(f => {
    const next = { ...f, [key]: val }
    // Auto-calculate builtup_sqft
    if (key === 'plot_length_ft' || key === 'plot_width_ft' || key === 'floors') {
      next.builtup_sqft = Math.round((next.plot_length_ft * next.plot_width_ft * 0.7) * next.floors)
    }
    return next
  })

  const handleCreate = () => {
    const name = form.project_name.trim() || `Project ${form.city} ${form.bhk_type}`
    // Reset only data that has client-side fallbacks (cost, schedule)
    // Keep risks, resources, compliance (no local calculator — seed data is the baseline)
    setFloorPlan(null)
    setCostEstimate(null)
    setSchedule(null)
    // Set the new project
    setProject({ ...form, project_name: name })
    setActivePage('dashboard')
    onClose()
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-1 border border-bdr-1 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-bg-1 border-b border-bdr-1 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal/15 flex items-center justify-center">
              <Building2 size={18} className="text-teal" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-txt-1">New Project</h2>
              <p className="text-[10px] text-txt-3">Enter your project details to get started</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-3 text-txt-3 hover:text-txt-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Project Name */}
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Project Name</label>
            <input type="text" value={form.project_name} onChange={e => update('project_name', e.target.value)}
              placeholder="e.g. Sai Krupa Residency"
              className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 outline-none focus:border-teal/40 placeholder:text-txt-3 transition-colors" />
          </div>

          {/* City + Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">City</label>
              <select value={form.city} onChange={e => update('city', e.target.value)}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 outline-none focus:border-teal/40">
                {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Project Type</label>
              <div className="flex gap-2">
                {['residential', 'commercial'].map(t => (
                  <button key={t} onClick={() => update('project_type', t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${form.project_type === t ? 'bg-teal/15 text-teal border border-teal/30' : 'bg-bg-4 text-txt-2 border border-bdr-1 hover:border-bdr-2'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plot Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Plot Length (ft)</label>
              <input type="number" value={form.plot_length_ft} onChange={e => update('plot_length_ft', Number(e.target.value))} min={15} max={300}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Plot Width (ft)</label>
              <input type="number" value={form.plot_width_ft} onChange={e => update('plot_width_ft', Number(e.target.value))} min={15} max={300}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Floors</label>
              <input type="number" value={form.floors} onChange={e => update('floors', Number(e.target.value))} min={1} max={12}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
            </div>
          </div>

          {/* Built-up Area (auto-calculated) */}
          <div className="bg-bg-3 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-txt-2">Estimated Built-up Area</span>
            <span className="text-sm font-mono font-semibold text-teal">{form.builtup_sqft.toLocaleString('en-IN')} sqft</span>
          </div>

          {/* BHK Selector */}
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">BHK Configuration</label>
            <div className="flex gap-2">
              {BHK_OPTIONS.map(b => (
                <button key={b} onClick={() => update('bhk_type', b)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${form.bhk_type === b ? 'bg-teal/15 text-teal border border-teal/30' : 'bg-bg-4 text-txt-2 border border-bdr-1 hover:border-bdr-2'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Tier */}
          <div>
            <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Quality Tier</label>
            <div className="grid grid-cols-4 gap-2">
              {QUALITY_OPTIONS.map(q => (
                <button key={q.value} onClick={() => update('quality', q.value)}
                  className={`py-2.5 px-2 rounded-lg text-center transition-all ${form.quality === q.value ? 'bg-teal/15 text-teal border border-teal/30' : 'bg-bg-4 text-txt-2 border border-bdr-1 hover:border-bdr-2'}`}>
                  <p className="text-xs font-medium">{q.label}</p>
                  <p className="text-[9px] mt-0.5 opacity-60">{q.range}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date + Soil */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Start Month</label>
              <select value={form.start_month} onChange={e => update('start_month', Number(e.target.value))}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 outline-none focus:border-teal/40">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Start Year</label>
              <select value={form.start_year} onChange={e => update('start_year', Number(e.target.value))}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 outline-none focus:border-teal/40">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Soil Type</label>
              <select value={form.soil_type} onChange={e => update('soil_type', e.target.value)}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 outline-none focus:border-teal/40">
                {['soft', 'medium', 'hard', 'rocky'].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Budget + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Budget (₹ Lakhs)</label>
              <input type="number" value={form.budget_lakhs} onChange={e => update('budget_lakhs', Number(e.target.value))} min={10} max={5000}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
            </div>
            <div>
              <label className="text-[10px] text-txt-3 uppercase tracking-widest mb-1.5 block">Deadline (Months)</label>
              <input type="number" value={form.deadline_months} onChange={e => update('deadline_months', Number(e.target.value))} min={6} max={48}
                className="w-full bg-bg-4 border border-bdr-1 rounded-lg px-3 py-2.5 text-sm text-txt-1 font-mono outline-none focus:border-teal/40" />
            </div>
          </div>

          {/* Vastu Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs text-txt-1">Vastu Compliant Layout</p>
              <p className="text-[10px] text-txt-3">Rooms placed per Vastu Shastra directions</p>
            </div>
            <button onClick={() => update('vastu', !form.vastu)}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.vastu ? 'bg-teal' : 'bg-bg-4 border border-bdr-1'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.vastu ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-1 border-t border-bdr-1 px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-txt-3 hover:text-txt-1 transition-colors">Cancel</button>
          <Button onClick={handleCreate} size="lg">
            Create Project & Generate
          </Button>
        </div>
      </div>
    </div>
  )
}
