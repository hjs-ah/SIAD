import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDark, toggle } = useTheme()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(email)
      if (!result.success) setError(result.error)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'var(--bg-base)' }}>

      {/* Theme toggle */}
      <button onClick={toggle}
        className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      <div className="w-full max-w-sm mx-auto px-6 animate-fade-up">
        {/* Mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--border-mid)' }}>
            <span style={{ color: 'var(--gold-main)', fontSize: '18px' }}>✦</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Dissertation Dashboard
          </h1>
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            SIAD Framework · VOW Center · Hampton University
          </p>
        </div>

        {/* SIAD bar */}
        <div className="flex gap-1 mb-8">
          {[['#B8891A','S'],['#148585','I'],['#D4472E','A'],['#4E7D4C','D']].map(([c, l]) => (
            <div key={l} className="flex-1">
              <div className="h-0.5 rounded-full mb-1.5" style={{ background: c }} />
              <p className="text-[9px] font-mono text-center tracking-widest" style={{ color: 'var(--text-muted)' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold-main)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs"
              style={{ background: 'var(--coral-bg)', color: 'var(--coral-main)', border: '1px solid var(--coral-main)20' }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || !email}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            style={{ background: 'var(--gold-main)', color: '#fff' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Verifying…
              </span>
            ) : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs font-mono mt-6" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Access is by invitation only.
        </p>
      </div>
    </div>
  )
}
