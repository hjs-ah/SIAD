import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0A0A0F' }}>

      {/* Background geometry */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-96 opacity-10"
          style={{ background: 'linear-gradient(to bottom, #B8891A, transparent)' }} />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-px opacity-10"
          style={{ background: 'linear-gradient(to right, transparent, #B8891A, transparent)' }} />
        <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,100 L360,60 L720,120 L1080,40 L1440,100 L1440,200 L0,200 Z" fill="#B8891A" />
        </svg>
      </div>

      <div className="w-full max-w-sm mx-auto px-6 animate-fade-up">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{ background: 'rgba(184,137,26,0.15)', border: '1px solid rgba(184,137,26,0.3)' }}>
            <span className="text-xl text-gold-300">✦</span>
          </div>
          <h1 className="text-3xl text-ink-100 mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            Dissertation Dashboard
          </h1>
          <p className="text-xs text-ink-500 font-mono tracking-widest uppercase">
            SIAD Framework · VOW Center · Hampton University
          </p>
        </div>

        {/* SIAD bar */}
        <div className="flex gap-1 mb-8">
          {[
            ['S', '#B8891A', 'Stewardship'],
            ['I', '#148585', 'Incarnation'],
            ['A', '#D4472E', 'Activism'],
            ['D', '#4E7D4C', 'Discipleship'],
          ].map(([l, c, name]) => (
            <div key={l} className="flex-1 relative group cursor-default">
              <div className="h-px w-full mb-1.5 rounded-full" style={{ background: c }} />
              <p className="text-[9px] font-mono text-ink-600 text-center tracking-wider
                           group-hover:text-ink-400 transition-colors">
                {l}
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-ink-400 font-mono uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 text-sm
                         text-ink-200 placeholder-ink-600 outline-none transition-all
                         focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs text-coral-300"
              style={{ background: 'rgba(212,71,46,0.1)', border: '1px solid rgba(212,71,46,0.2)' }}>
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            style={{
              background: loading ? 'rgba(184,137,26,0.3)' : '#B8891A',
              color: loading ? '#E8C547' : '#0A0A0F',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : 'Access Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-700 mt-6 font-mono">
          Access is by invitation only.
        </p>
      </div>
    </div>
  )
}
