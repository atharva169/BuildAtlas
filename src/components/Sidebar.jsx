import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Home, Grid3x3, IndianRupee, CalendarDays,
  Users, ShieldAlert, SlidersHorizontal, ArrowLeftRight, Timer,
  Layers, Bot, FileText
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Start',
    items: [
      { to: '/', icon: Home, label: 'New Project' },
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Core Planning',
    items: [
      { to: '/floorplan', icon: Grid3x3, label: 'Floor Plan' },
      { to: '/cost', icon: IndianRupee, label: 'Cost Estimate' },
      { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
      { to: '/resources', icon: Users, label: 'Resources' },
      { to: '/risk', icon: ShieldAlert, label: 'Risk & Compliance' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/sandbox', icon: SlidersHorizontal, label: 'What-If Sandbox' },
      { to: '/reverse', icon: ArrowLeftRight, label: 'Reverse Planning' },
      { to: '/cascade', icon: Timer, label: 'Delay Cascade' },
      { to: '/materials', icon: Layers, label: 'Material Swap' },
      { to: '/copilot', icon: Bot, label: 'AI Copilot' },
    ]
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1rem',
        }}>
          BA
        </div>
        <div>
          <h2 className="gradient-text">BuildAtlas</h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Decision Intelligence
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="nav-icon" size={20} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px 20px', borderTop: '1px solid var(--border-default)',
        fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        India-calibrated · v1.0
      </div>
    </aside>
  );
}
