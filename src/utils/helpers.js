// ─── SIAD Pillars ─────────────────────────────────────────────────────────────
export const SIAD_PILLARS = {
  Stewardship: { key: 'S', cls: 'tag-s' },
  Incarnation:  { key: 'I', cls: 'tag-i' },
  Activism:     { key: 'A', cls: 'tag-a' },
  Discipleship: { key: 'D', cls: 'tag-d' },
}

// ─── Status config — uses CSS variables so light/dark auto-adapts ─────────────
const S = (bg, text, dot) => ({ bg, text, dot, color: dot })

export const STATUS_CONFIG = {
  'Active':       S('var(--status-active-bg)',    'var(--status-active-text)',   'var(--status-active-dot)'),
  'In Progress':  S('var(--status-progress-bg)',  'var(--status-progress-text)', 'var(--status-progress-dot)'),
  'Drafting':     S('var(--status-progress-bg)',  'var(--status-progress-text)', 'var(--status-progress-dot)'),
  'Outlining':    S('var(--status-hold-bg)',       'var(--status-hold-text)',     'var(--status-hold-dot)'),
  'In Review':    S('var(--status-done-bg)',       'var(--status-done-text)',     'var(--status-done-dot)'),
  'Revising':     S('var(--status-progress-bg)',  'var(--status-progress-text)', 'var(--status-progress-dot)'),
  'Complete':     S('var(--status-done-bg)',       'var(--status-done-text)',     'var(--status-done-dot)'),
  'Completed':    S('var(--status-done-bg)',       'var(--status-done-text)',     'var(--status-done-dot)'),
  'Not Started':  S('var(--status-none-bg)',       'var(--status-none-text)',     'var(--status-none-dot)'),
  'Planned':      S('var(--status-none-bg)',       'var(--status-none-text)',     'var(--status-none-dot)'),
  'On Hold':      S('var(--status-hold-bg)',       'var(--status-hold-text)',     'var(--status-hold-dot)'),
  'Blocked':      S('var(--status-blocked-bg)',    'var(--status-blocked-text)',  'var(--status-blocked-dot)'),
  'Launching':    S('var(--status-done-bg)',       'var(--status-done-text)',     'var(--status-done-dot)'),
  'Researching':  S('var(--status-hold-bg)',       'var(--status-hold-text)',     'var(--status-hold-dot)'),
  'Writing':      S('var(--status-progress-bg)',  'var(--status-progress-text)', 'var(--status-progress-dot)'),
  'Submitted':    S('var(--status-done-bg)',       'var(--status-done-text)',     'var(--status-done-dot)'),
  'Awarded':      S('var(--status-active-bg)',     'var(--status-active-text)',   'var(--status-active-dot)'),
  'Declined':     S('var(--status-blocked-bg)',    'var(--status-blocked-text)',  'var(--status-blocked-dot)'),
}

export function getStatus(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Not Started']
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatCurrency(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(dateStr)
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function chapterProgress(status) {
  const map = { 'Not Started':0, 'Outlining':15, 'Drafting':40, 'In Review':70, 'Revising':85, 'Complete':100 }
  return map[status] ?? 0
}

export function wordCountProgress(current, goal) {
  if (!goal) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}

export function pluralize(count, word) {
  return `${count} ${word}${count !== 1 ? 's' : ''}`
}
