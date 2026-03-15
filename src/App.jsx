import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Sidebar from './components/shared/Sidebar'
import LoginPage from './views/LoginPage'
import OverviewPage from './views/OverviewPage'
import DissertationPage from './views/DissertationPage'
import VowCenterPage from './views/VowCenterPage'
import GrantsPage from './views/GrantsPage'
import CommentsPage from './views/CommentsPage'
import { Sun, Moon } from 'lucide-react'

function DefaultRedirect() {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/" replace />
  if (user.role === 'ministry') return <Navigate to="/vow" replace />
  if (user.role === 'grant_writer') return <Navigate to="/grants" replace />
  return <Navigate to="/dissertation" replace />
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-50 w-9 h-9 rounded-full flex items-center justify-center
                 shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: isDark ? '#2C2A24' : '#FFFFFF',
        border: `1px solid ${isDark ? '#3C3A30' : '#E2DED6'}`,
        color: isDark ? '#E8C547' : '#7A5C10',
        boxShadow: isDark
          ? '0 2px 8px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.12)',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

function AppLayout({ children }) {
  const { isDark } = useTheme()
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen overflow-y-auto"
        style={{ background: 'var(--bg-base)' }}>
        {children}
      </main>
      <ThemeToggle />
    </div>
  )
}

function PrivateRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--border-mid)', color: 'var(--gold-main)' }}>
            ✦
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (requiredRoles && !requiredRoles.includes(user.role)) return <DefaultRedirect />
  return <AppLayout>{children}</AppLayout>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <DefaultRedirect /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><OverviewPage /></PrivateRoute>} />
      <Route path="/dissertation" element={<PrivateRoute requiredRoles={['admin','chair','committee']}><DissertationPage /></PrivateRoute>} />
      <Route path="/vow" element={<PrivateRoute requiredRoles={['admin','ministry']}><VowCenterPage /></PrivateRoute>} />
      <Route path="/grants" element={<PrivateRoute requiredRoles={['admin','grant_writer']}><GrantsPage /></PrivateRoute>} />
      <Route path="/comments" element={<PrivateRoute requiredRoles={['admin','chair','committee','ministry']}><CommentsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
