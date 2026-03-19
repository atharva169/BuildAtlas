// FILE: src/components/layout/Sidebar.jsx
import React, { useState } from 'react'
import useProjectStore from '../../store/projectStore'
import { NAV_ITEMS } from '../../utils/constants'
import NewProjectModal from '../features/project/NewProjectModal'
import { LayoutDashboard, Grid3X3, IndianRupee, CalendarDays, ArrowLeftRight, Layers, Users, Building2, SlidersHorizontal, Shield, Zap, Plus } from 'lucide-react'

const ICON_MAP = { LayoutDashboard, Grid3X3, IndianRupee, CalendarDays, ArrowLeftRight, Layers, Users, SlidersHorizontal, Shield, Zap }

export default function Sidebar({ open, onClose }) {
  const { activePage, setActivePage, currentProject } = useProjectStore()
  const [showNewProject, setShowNewProject] = useState(false)

  return (
    <>
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[200px] bg-bg-1 border-r border-bdr-1 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-bdr-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center">
            <Building2 size={18} className="text-teal" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-txt-1 tracking-tight">BuildAtlas</h1>
            <span className="text-[10px] text-teal font-mono">GenAI</span>
          </div>
        </div>

        {/* Project Badge + New Project Button */}
        <div className="px-3 mt-3 space-y-2">
          <div className="px-3 py-3 rounded-lg bg-bg-2 border border-bdr-1">
            <p className="text-[10px] text-txt-3 uppercase tracking-widest mb-0.5">Active Project</p>
            <p className="text-xs text-txt-1 font-medium truncate">{currentProject?.project_name || 'No Project'}</p>
            <p className="text-[10px] text-txt-2 mt-0.5">{currentProject?.city} · {currentProject?.bhk_type} · {currentProject?.floors}F</p>
          </div>
          <button onClick={() => setShowNewProject(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal/10 text-teal text-xs font-medium hover:bg-teal/20 border border-teal/20 transition-all">
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const IconComp = ICON_MAP[item.icon] || LayoutDashboard
            const active = activePage === item.id
            return (
              <button key={item.id} onClick={() => { setActivePage(item.id); onClose?.() }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 group
                  ${active ? 'bg-teal/8 text-teal border-l-2 border-teal' : 'text-txt-2 hover:text-txt-1 hover:bg-bg-3 border-l-2 border-transparent'}`}>
                <IconComp size={15} className={active ? 'text-teal' : 'text-txt-3 group-hover:text-txt-2'} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-bdr-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center text-xs font-semibold text-violet">BA</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-txt-1 truncate">BuildAtlas User</p>
            <p className="text-[10px] text-txt-3">Hackathon Demo</p>
          </div>
        </div>
      </aside>

      {/* New Project Modal */}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </>
  )
}
