import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/shared/Sidebar'
import LoginPage from './views/LoginPage'
import OverviewPage from './views/OverviewPage'
import DissertationPage from './views/DissertationPage'
import VowCenterPage from './views/VowCenterPage'
import GrantsPage from './views/GrantsPage'
import CommentsPage from './views/CommentsPage'

// Role-based redirect: collaborators land on their scoped view
function DefaultRedirect() {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/" replace />
  if (user.role === 'ministry') return <Navigate to="/vow" replace />
  if (user.role === 'grant_writer') return <Navigate to="/grants" replace />
  return <Navigate to="/dissertation" replace />
}

// Layout wrapper for authenticated pages
function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen overflow-y-auto" style={{ background: '#0A0A0F' }}>
        {children}
      </main>
    </div>
  )
}

// Guard: redirect to login if not authenticated
function PrivateRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg animate-pulse"
            style={{ background: 'rgba(184,137,26,0.2)' }}>✦</div>
          <p className="text-xs text-ink-600 font-mono">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <DefaultRedirect />
  }

  return <AppLayout>{children}</AppLayout>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <DefaultRedirect /> : <LoginPage />} />

      <Route path="/" element={
        <PrivateRoute>
          <OverviewPage />
        </PrivateRoute>
      } />

      <Route path="/dissertation" element={
        <PrivateRoute requiredRoles={['admin','chair','committee']}>
          <DissertationPage />
        </PrivateRoute>
      } />

      <Route path="/vow" element={
        <PrivateRoute requiredRoles={['admin','ministry']}>
          <VowCenterPage />
        </PrivateRoute>
      } />

      <Route path="/grants" element={
        <PrivateRoute requiredRoles={['admin','grant_writer']}>
          <GrantsPage />
        </PrivateRoute>
      } />

      <Route path="/comments" element={
        <PrivateRoute requiredRoles={['admin','chair','committee','ministry']}>
          <CommentsPage />
        </PrivateRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
