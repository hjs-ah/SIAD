import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  BookOpen, Building2, DollarSign, MessageSquare,
  LayoutDashboard, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Overview',         roles: ['admin','chair','committee','ministry','grant_writer'] },
  { to: '/dissertation', icon: BookOpen,         label: 'Dissertation Hub', roles: ['admin','chair','committee'] },
  { to: '/vow',          icon: Building2,        label: 'VOW Center',       roles: ['admin','ministry'] },
  { to: '/grants',       icon: DollarSign,       label: 'Grant Pipeline',   roles: ['admin','grant_writer'] },
  { to: '/comments',     icon: MessageSquare,    label: 'Comments',         roles: ['admin','chair','committee','ministry'] },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()

  const visibleNav = NAV.filter(item =>
    isAdmin || item.roles.includes(user?.role)
  )

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0"
            style={{ background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.35)' }}>
            <span style={{ color: '#E8C547' }}>✦</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono tracking-widest uppercase leading-none"
              style={{ color: '#D4A829' }}>Dissertation</p>
            <p className="text-[10px] font-mono mt-0.5 tracking-wider"
              style={{ color: 'var(--sidebar-text)' }}>SIAD Dashboard</p>
          </div>
        </div>
      </div>

      {/* SIAD bar */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex gap-0.5 mb-1.5">
          {[['#B8891A','S'],['#148585','I'],['#D4472E','A'],['#4E7D4C','D']].map(([c, l]) => (
            <div key={l} className="flex-1 h-0.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <p className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--sidebar-text)', opacity: 0.6 }}>
          S · I · A · D
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${isActive ? 'active-nav' : ''}`
            }
            style={({ isActive }) => ({
              background: isActive ? 'rgba(184,137,26,0.15)' : 'transparent',
              color: isActive ? '#E8C547' : 'var(--sidebar-text)',
              borderLeft: isActive ? '2px solid #B8891A' : '2px solid transparent',
              paddingLeft: isActive ? '10px' : '12px',
            })}
          >
            <Icon size={15} />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight size={12} style={{ opacity: 0.3 }} className="group-hover:opacity-60 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: '#9C988E' }}>{user?.email}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5"
              style={{ color: user?.role === 'admin' ? '#D4A829' : 'var(--sidebar-text)' }}>
              {user?.role === 'admin' ? '✦ Admin' : user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--sidebar-text)' }}
            onMouseEnter={e => e.target.style.color = '#E8705A'}
            onMouseLeave={e => e.target.style.color = 'var(--sidebar-text)'}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
