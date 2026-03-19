// FILE: src/components/layout/Header.jsx
import React from 'react'
import useProjectStore from '../../store/projectStore'
import { Menu, Bell, Search } from 'lucide-react'

export default function Header({ onMenuClick }) {
  const { activePage, currentProject } = useProjectStore()
  const titles = {
    dashboard: 'Dashboard',
    floorplan: 'Floor Plan Generator',
    estimator: 'Cost Estimator',
    whatif: 'What-If Sandbox',
    schedule: 'Schedule & Gantt',
    cascade: 'Delay Cascade Predictor',
    risks: 'Risk Prediction Engine',
    reverse: 'Reverse Planning',
    materials: 'Material Swap Intelligence',
    resources: 'Resource Allocation',
  }

  return (
    <header className="h-14 bg-bg-1 border-b border-bdr-1 flex items-center px-4 gap-4 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-bg-3 text-txt-2">
        <Menu size={18} />
      </button>
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-txt-1">{titles[activePage] || 'Dashboard'}</h2>
        <p className="text-[10px] text-txt-3">{currentProject?.project_name} · {currentProject?.city} · {currentProject?.bhk_type}</p>
      </div>
      <div className="hidden md:flex items-center gap-2 bg-bg-2 rounded-lg px-3 py-1.5 border border-bdr-1 w-56">
        <Search size={13} className="text-txt-3" />
        <input type="text" placeholder="Search features..." className="bg-transparent text-xs text-txt-1 outline-none w-full placeholder:text-txt-3" />
      </div>
      <button className="p-1.5 rounded-lg hover:bg-bg-3 text-txt-2 relative">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal" />
      </button>
    </header>
  )
}
