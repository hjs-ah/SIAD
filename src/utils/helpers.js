// ─── SIAD helpers ─────────────────────────────────────────────────────────────
export const SIAD_PILLARS = {
  Stewardship: { key: 'S', color: '#B8891A', light: 'rgba(184,137,26,0.15)', text: '#E8C547', cls: 'tag-s' },
  Incarnation:  { key: 'I', color: '#148585', light: 'rgba(20,133,133,0.15)', text: '#7ACECE', cls: 'tag-i' },
  Activism:     { key: 'A', color: '#D4472E', light: 'rgba(212,71,46,0.15)',  text: '#F2A898', cls: 'tag-a' },
  Discipleship: { key: 'D', color: '#4E7D4C', light: 'rgba(78,125,76,0.15)', text: '#A8CBA6', cls: 'tag-d' },
}

// ─── Status helpers ───────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  'Active':       { color: '#4E7D4C', bg: 'rgba(78,125,76,0.15)',    text: '#A8CBA6',  dot: '#6FA06C' },
  'In Progress':  { color: '#B8891A', bg: 'rgba(184,137,26,0.15)',   text: '#E8C547',  dot: '#D4A829' },
  'Drafting':     { color: '#B8891A', bg: 'rgba(184,137,26,0.15)',   text: '#E8C547',  dot: '#D4A829' },
  'Outlining':    { color: '#6B6B8F', bg: 'rgba(107,107,143,0.15)',  text: '#C4C4D4',  dot: '#9494AF' },
  'In Review':    { color: '#148585', bg: 'rgba(20,133,133,0.15)',   text: '#7ACECE',  dot: '#1FA8A8' },
  'Revising':     { color: '#B8891A', bg: 'rgba(184,137,26,0.15)',   text: '#E8C547',  dot: '#D4A829' },
  'Complete':     { color: '#148585', bg: 'rgba(20,133,133,0.15)',   text: '#7ACECE',  dot: '#1FA8A8' },
  'Completed':    { color: '#148585', bg: 'rgba(20,133,133,0.15)',   text: '#7ACECE',  dot: '#1FA8A8' },
  'Not Started':  { color: '#4A4A6A', bg: 'rgba(74,74,106,0.15)',   text: '#9494AF',  dot: '#6B6B8F' },
  'Planned':      { color: '#4A4A6A', bg: 'rgba(74,74,106,0.15)',   text: '#9494AF',  dot: '#6B6B8F' },
  'On Hold':      { color: '#6B6B8F', bg: 'rgba(107,107,143,0.15)', text: '#C4C4D4',  dot: '#9494AF' },
  'Blocked':      { color: '#D4472E', bg: 'rgba(212,71,46,0.15)',   text: '#F2A898',  dot: '#E8705A' },
  'Launching':    { color: '#148585', bg: 'rgba(20,133,133,0.15)',   text: '#7ACECE',  dot: '#1FA8A8' },
  'Researching':  { color: '#6B6B8F', bg: 'rgba(107,107,143,0.15)', text: '#C4C4D4',  dot: '#9494AF' },
  'Writing':      { color: '#B8891A', bg: 'rgba(184,137,26,0.15)',   text: '#E8C547',  dot: '#D4A829' },
  'Submitted':    { color: '#148585', bg: 'rgba(20,133,133,0.15)',   text: '#7ACECE',  dot: '#1FA8A8' },
  'Awarded':      { color: '#4E7D4C', bg: 'rgba(78,125,76,0.15)',   text: '#A8CBA6',  dot: '#6FA06C' },
  'Declined':     { color: '#D4472E', bg: 'rgba(212,71,46,0.15)',   text: '#F2A898',  dot: '#E8705A' },
}

export function getStatus(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Not Started']
}

// ─── Format helpers ───────────────────────────────────────────────────────────
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
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(dateStr)
}

// ─── Progress calculation ──────────────────────────────────────────────────────
export function chapterProgress(status) {
  const map = { 'Not Started': 0, 'Outlining': 15, 'Drafting': 40, 'In Review': 70, 'Revising': 85, 'Complete': 100 }
  return map[status] ?? 0
}

export function wordCountProgress(current, goal) {
  if (!goal) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}

// ─── Misc ──────────────────────────────────────────────────────────────────────
export function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function pluralize(count, word) {
  return `${count} ${word}${count !== 1 ? 's' : ''}`
}
