import { SIAD_PILLARS, getStatus } from '../../utils/helpers'

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status, size = 'sm' }) {
  const cfg = getStatus(status)
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
  return (
    <span className={`badge ${pad}`}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.dot + '50', border: '1px solid' }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {status}
    </span>
  )
}

// ─── SIAD Tags ────────────────────────────────────────────────────────────────
export function SiadTags({ pillars = [] }) {
  if (!pillars.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {pillars.map(p => {
        const cfg = SIAD_PILLARS[p]
        if (!cfg) return null
        return (
          <span key={p} className={`badge text-[10px] px-2 py-0.5 ${cfg.cls}`}>
            {cfg.key}
          </span>
        )
      })}
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color, height = 4, showLabel = false }) {
  const barColor = color || 'var(--gold-main)'
  return (
    <div className="w-full">
      <div className="progress-track" style={{ height }}>
        <div className="progress-fill" style={{ width: `${value}%`, background: barColor, height }} />
      </div>
      {showLabel && <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{value}%</p>}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '◌', message, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-3xl mb-3" style={{ color: 'var(--border-mid)' }}>{icon}</span>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon }) {
  const c = color || 'var(--gold-main)'
  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-3xl font-light" style={{ color: c }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-40">{icon}</span>}
      </div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary:   { background: 'var(--gold-main)',  color: '#fff' },
    secondary: { background: 'var(--bg-raised)',  color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' },
    ghost:     { background: 'transparent',       color: 'var(--text-muted)' },
    danger:    { background: 'var(--coral-main)', color: '#fff' },
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant]}>
      {children}
    </button>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative w-8 h-4 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--gold-main)' : 'var(--border-mid)' }}
        onClick={() => onChange(!checked)}>
        <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm"
          style={{ transform: checked ? 'translateX(17px)' : 'translateX(2px)' }} />
      </div>
      {label && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>}
    </label>
  )
}
