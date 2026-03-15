import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  BookOpen, Building2, DollarSign, MessageSquare,
  LayoutDashboard, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Overview',        roles: ['admin','chair','committee','ministry','grant_writer'] },
  { to: '/dissertation',icon: BookOpen,        label: 'Dissertation Hub', roles: ['admin','chair','committee'] },
  { to: '/vow',         icon: Building2,       label: 'VOW Center',       roles: ['admin','ministry'] },
  { to: '/grants',      icon: DollarSign,      label: 'Grant Pipeline',   roles: ['admin','grant_writer'] },
  { to: '/comments',    icon: MessageSquare,   label: 'Comments',         roles: ['admin','chair','committee','ministry'] },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const visibleNav = NAV.filter(item =>
    isAdmin || item.roles.includes(user?.role)
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{ background: '#0D0D14', borderRight: '1px solid #1A1A24' }}>

      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
            style={{ background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.3)' }}>
            ✦
          </div>
          <div>
            <p className="text-xs font-mono text-gold-300 tracking-widest uppercase leading-none">Dissertation</p>
            <p className="text-[10px] text-ink-500 font-mono mt-0.5">SIAD Dashboard</p>
          </div>
        </div>
      </div>

      {/* SIAD Pillars indicator */}
      <div className="px-5 py-3 border-b border-ink-800">
        <div className="flex gap-1">
          {['S','I','A','D'].map((l, i) => (
            <div key={l} className="flex-1 h-0.5 rounded-full"
              style={{ background: ['#B8891A','#148585','#D4472E','#4E7D4C'][i] }} />
          ))}
        </div>
        <p className="text-[9px] text-ink-600 font-mono mt-1.5 tracking-widest">STEWARDSHIP · INCARNATION · ACTIVISM · DISCIPLESHIP</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
               ${isActive
                 ? 'bg-gold-500/10 text-gold-300 border-l-2 border-gold-500 pl-[10px]'
                 : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'
               }`
            }
          >
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-ink-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-ink-300 truncate">{user?.email}</p>
            <p className="text-[10px] text-ink-600 font-mono uppercase tracking-wider mt-0.5">
              {user?.role === 'admin' ? '✦ Admin' : user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-ink-600 hover:text-coral-300 transition-colors rounded"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
