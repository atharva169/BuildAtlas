// FILE: src/components/layout/Layout.jsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import RightCopilot from './RightCopilot'
import { MessageSquare } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-bg-0">
      {/* Mobile overlay */}
      {(sidebarOpen || copilotOpen) && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => { setSidebarOpen(false); setCopilotOpen(false) }} />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="page-enter max-w-[1400px]">{children}</div>
        </main>
      </div>

      <RightCopilot open={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Mobile Copilot FAB */}
      <button onClick={() => setCopilotOpen(!copilotOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-teal flex items-center justify-center shadow-lg shadow-teal/20 hover:scale-105 transition-transform">
        <MessageSquare size={20} className="text-bg-0" />
      </button>
    </div>
  )
}
