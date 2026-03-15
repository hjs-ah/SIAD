import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Parse collaborator list from env: "email:role,email:role"
function parseCollaborators() {
  const raw = import.meta.env.VITE_COLLABORATOR_EMAILS || ''
  const map = {}
  raw.split(',').forEach(entry => {
    const [email, role] = entry.trim().split(':')
    if (email) map[email.toLowerCase()] = role || 'viewer'
  })
  return map
}

function getAdmins() {
  return (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('dd_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  function login(email) {
    const normalized = email.trim().toLowerCase()
    const admins = getAdmins()
    const collaborators = parseCollaborators()

    let role = null
    if (admins.includes(normalized)) {
      role = 'admin'
    } else if (collaborators[normalized]) {
      role = collaborators[normalized]
    }

    if (!role) return { success: false, error: 'Access denied. This email is not on the invite list.' }

    const userData = { email: normalized, role }
    localStorage.setItem('dd_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true }
  }

  function logout() {
    localStorage.removeItem('dd_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isChair = user?.role === 'chair'
  const isCommittee = user?.role === 'committee'
  const isMinistry = user?.role === 'ministry'
  const canComment = !!user && user.role !== 'viewer'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isChair, isCommittee, isMinistry, canComment }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
