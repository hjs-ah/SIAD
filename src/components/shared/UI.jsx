import { getStatus, SIAD_PILLARS } from '../../utils/helpers'

// ─── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status, size = 'sm' }) {
  const cfg = getStatus(status)
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
  return (
    <span
      className={`badge ${pad} font-mono tracking-wider`}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.color + '40' }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: cfg.dot }} />
      {status}
    </span>
  )
}

// ─── SIAD Pillar Tags ──────────────────────────────────────────────────────────
export function SiadTags({ pillars = [] }) {
  if (!pillars.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {pillars.map(p => {
        const cfg = SIAD_PILLARS[p]
        if (!cfg) return null
        return (
          <span
            key={p}
            className="badge text-[10px] px-2 py-0.5 font-mono"
            style={{ background: cfg.light, color: cfg.text, borderColor: cfg.color + '40' }}
          >
            {cfg.key}
          </span>
        )
      })}
    </div>
  )
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = '#B8891A', height = 4, showLabel = false }) {
  return (
    <div className="w-full">
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{ width: `${value}%`, background: color, height }}
        />
      </div>
      {showLabel && (
        <p className="text-[10px] text-ink-400 mt-1 font-mono">{value}%</p>
      )}
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
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
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl text-ink-100" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '◌', message, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl text-ink-700 mb-3">{icon}</span>
      <p className="text-ink-400 text-sm max-w-xs">{message}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = '#B8891A', icon }) {
  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-400 font-mono uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-light text-ink-100" style={{ fontFamily: 'var(--font-display)', color }}>
            {value}
          </p>
          {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <span className="text-2xl opacity-50">{icon}</span>
        )}
      </div>
    </div>
  )
}

// ─── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'inline-flex items-center gap-2 rounded-lg font-body font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-gold-500 hover:bg-gold-400 text-ink-950 active:scale-95',
    secondary: 'bg-ink-800 hover:bg-ink-700 text-ink-200 border border-ink-600 active:scale-95',
    ghost: 'text-ink-400 hover:text-ink-200 hover:bg-ink-800 active:scale-95',
    danger: 'bg-coral-500 hover:bg-coral-400 text-white active:scale-95',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className="relative w-8 h-4 rounded-full transition-colors duration-200"
        style={{ background: checked ? '#B8891A' : '#32324A' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow"
          style={{ transform: checked ? 'translateX(17px)' : 'translateX(2px)' }}
        />
      </div>
      {label && <span className="text-xs text-ink-400 group-hover:text-ink-200">{label}</span>}
    </label>
  )
}
