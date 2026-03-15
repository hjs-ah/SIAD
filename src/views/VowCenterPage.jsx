import { useEffect, useState } from 'react'
import {
  getPrograms, getMilestones,
  toggleProgramVisibility, updateProgramStatus,
  toggleMilestoneVisibility
} from '../../api/notion'
import {
  StatusBadge, SiadTags, SectionHeader, CardSkeleton,
  Button, EmptyState, Toggle, StatCard
} from '../../components/shared/UI'
import { formatDate, timeAgo, getStatus } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Plus, RefreshCw, CheckCircle2, Circle, Clock } from 'lucide-react'

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ program, isAdmin, onToggleVisibility, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const p = program.props
  const status = p?.Status || 'Planned'
  const visible = p?.['Visible on Dashboard']

  const STATUS_OPTIONS = ['Active','Launching','Planned','On Hold','Completed']

  return (
    <div className={`card card-interactive transition-opacity ${!visible && isAdmin ? 'opacity-50' : ''}`}>
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Initiative type dot */}
              <span className="text-base">
                {{ Mentorship:'♟', Education:'📖', Evangelism:'✝', Conference:'🏛', 'Theological Education':'✦', 'Community Service':'🤝' }[p?.['Initiative Type']] || '◎'}
              </span>
              <h3 className="text-sm text-ink-100" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                {p?.['Program Name'] || 'Untitled'}
              </h3>
            </div>
            <SiadTags pillars={p?.['SIAD Pillar'] || []} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={e => { e.stopPropagation(); onToggleVisibility(program.id, !visible) }}
                className="p-1.5 rounded transition-colors text-ink-600 hover:text-ink-300"
                title={visible ? 'Hide from dashboard' : 'Show on dashboard'}>
                {visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            )}
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-ink-800 pt-4 space-y-3 animate-fade-in">
          {p?.Description && (
            <p className="text-xs text-ink-400 leading-relaxed">{p.Description}</p>
          )}
          {p?.['Target Population'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1">Target Population</p>
              <p className="text-xs text-ink-400">{p['Target Population']}</p>
            </div>
          )}
          {p?.['Impact Summary'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1">Impact</p>
              <p className="text-xs text-ink-400">{p['Impact Summary']}</p>
            </div>
          )}
          {p?.['Dissertation Connection'] && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(184,137,26,0.06)', border: '1px solid rgba(184,137,26,0.15)' }}>
              <p className="text-[10px] font-mono text-gold-600 uppercase tracking-widest mb-1">Dissertation Connection</p>
              <p className="text-xs text-ink-400">{p['Dissertation Connection']}</p>
            </div>
          )}
          {p?.['Enrollment Count'] > 0 && (
            <p className="text-xs text-ink-500 font-mono">Enrollment: {p['Enrollment Count']}</p>
          )}

          {/* Admin status changer */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink-800">
              <span className="text-[10px] text-ink-600 font-mono mr-1">Status:</span>
              {STATUS_OPTIONS.map(s => {
                const cfg = getStatus(s)
                return (
                  <button key={s}
                    onClick={() => onStatusChange(program.id, s)}
                    className="text-[10px] px-2 py-0.5 rounded-full font-mono transition-all"
                    style={{
                      background: status === s ? cfg.bg : 'transparent',
                      color: status === s ? cfg.text : '#4A4A6A',
                      border: `1px solid ${status === s ? cfg.color + '60' : '#32324A'}`,
                    }}>
                    {s}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Milestone Row ────────────────────────────────────────────────────────────
function MilestoneRow({ milestone, isAdmin, onToggleVisibility }) {
  const p = milestone.props
  const status = p?.Status || 'Not Started'
  const visible = p?.['Visible on Dashboard']
  const org = p?.Organization || 'General Ops'

  const iconMap = {
    'Completed': <CheckCircle2 size={14} className="text-teal-300 shrink-0" />,
    'In Progress': <Clock size={14} className="text-gold-400 shrink-0" />,
    'Active': <CheckCircle2 size={14} className="text-teal-300 shrink-0" />,
    'Not Started': <Circle size={14} className="text-ink-700 shrink-0" />,
    'Blocked': <Circle size={14} className="text-coral-400 shrink-0" />,
  }

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-ink-800 last:border-0 group
      ${!visible && isAdmin ? 'opacity-40' : ''}`}>
      <div className="mt-0.5">{iconMap[status] || <Circle size={14} className="text-ink-700 shrink-0" />}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-ink-300 leading-snug">{p?.Milestone || 'Untitled'}</p>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => onToggleVisibility(milestone.id, !visible)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-600 hover:text-ink-300 p-0.5">
                {visible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
            )}
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-mono" style={{
            color: org === 'Truth Bible Institute' ? '#A8CBA6' : org === 'VOW Center 501c3' ? '#7ACECE' : '#6B6B8F'
          }}>{org}</span>
          {p?.['Target Date'] && (
            <span className="text-[10px] text-ink-700 font-mono">→ {formatDate(p['Target Date'])}</span>
          )}
        </div>
        {p?.Notes && (
          <p className="text-[10px] text-ink-600 mt-1 leading-relaxed">{p.Notes}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VowCenterPage() {
  const { isAdmin } = useAuth()
  const [programs, setPrograms] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    const [pr, ms] = await Promise.allSettled([getPrograms(), getMilestones()])
    if (pr.status === 'fulfilled') setPrograms(pr.value?.results || [])
    if (ms.status === 'fulfilled') setMilestones(ms.value?.results || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleToggleProgram(id, visible) {
    await toggleProgramVisibility(id, visible)
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, props: { ...p.props, 'Visible on Dashboard': visible } } : p))
  }

  async function handleStatusChange(id, status) {
    await updateProgramStatus(id, status)
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, props: { ...p.props, Status: status } } : p))
  }

  async function handleToggleMilestone(id, visible) {
    await toggleMilestoneVisibility(id, visible)
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, props: { ...m.props, 'Visible on Dashboard': visible } } : m))
  }

  const visiblePrograms = isAdmin ? programs : programs.filter(p => p.props?.['Visible on Dashboard'])
  const filtered = filter === 'all' ? visiblePrograms : visiblePrograms.filter(p => p.props?.Status === filter)
  const c501 = milestones.filter(m => m.props?.Organization === 'VOW Center 501c3')
  const tbiMilestones = milestones.filter(m => m.props?.Organization === 'Truth Bible Institute')
  const completed501 = c501.filter(m => m.props?.Status === 'Completed').length
  const activeCount = programs.filter(p => p.props?.Status === 'Active').length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1">Verity Outreach Worship Center · Philadelphia, PA</p>
        <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
          VOW Center Ops
        </h1>
        <p className="text-sm text-ink-400 mt-1">Programs · Truth Bible Institute · 501(c)(3) Journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Programs" value={activeCount} sub={`${programs.length} total`} color="#4E7D4C" icon="⛪" />
        <StatCard label="501(c)(3) Steps" value={`${completed501}/${c501.length}`} sub="completed" color="#148585" icon="✓" />
        <StatCard label="TBI Milestones" value={tbiMilestones.filter(m => m.props?.Status === 'Completed').length} sub={`of ${tbiMilestones.length}`} color="#B8891A" icon="✦" />
        <StatCard label="SIAD Pillars" value="4" sub="S · I · A · D" color="#D4472E" icon="◈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Programs"
            subtitle={`${visiblePrograms.length} programs${isAdmin && programs.length !== visiblePrograms.length ? ` · ${programs.length - visiblePrograms.length} hidden` : ''}`}
            action={
              <div className="flex items-center gap-2">
                <button onClick={load} className="text-ink-600 hover:text-ink-400 transition-colors"><RefreshCw size={14} /></button>
                {/* Filter pills */}
                <div className="flex gap-1">
                  {['all','Active','Planned','On Hold'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className="text-[10px] px-2.5 py-1 rounded-full font-mono transition-all"
                      style={{
                        background: filter === f ? 'rgba(184,137,26,0.2)' : '#1A1A24',
                        color: filter === f ? '#E8C547' : '#6B6B8F',
                        border: `1px solid ${filter === f ? 'rgba(184,137,26,0.3)' : '#32324A'}`,
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
          {loading
            ? [1,2,3].map(i => <CardSkeleton key={i} />)
            : filtered.length === 0
              ? <EmptyState icon="◌" message="No programs match this filter" />
              : filtered.map(program => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    isAdmin={isAdmin}
                    onToggleVisibility={handleToggleProgram}
                    onStatusChange={handleStatusChange}
                  />
                ))
          }

          {/* Admin note */}
          {isAdmin && (
            <p className="text-[10px] text-ink-700 font-mono px-1">
              ✦ Eye icon toggles dashboard visibility · Status buttons update records
            </p>
          )}
        </div>

        {/* Right: Milestones */}
        <div className="space-y-6">
          {/* 501(c)(3) Journey */}
          <div className="card p-5">
            <SectionHeader title="501(c)(3) Journey"
              subtitle={`${completed501} of ${c501.length} complete`} />
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-ink-600">Progress</span>
                <span className="text-[10px] font-mono text-ink-500">
                  {Math.round(c501.length ? (completed501/c501.length)*100 : 0)}%
                </span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <div className="progress-fill"
                  style={{ width: `${Math.round(c501.length ? (completed501/c501.length)*100 : 0)}%`, background: '#148585', height: 4 }} />
              </div>
            </div>
            {loading
              ? [1,2,3].map(i => <div key={i} className="skeleton h-10 mb-2" />)
              : c501.map(m => (
                  <MilestoneRow key={m.id} milestone={m} isAdmin={isAdmin} onToggleVisibility={handleToggleMilestone} />
                ))
            }
          </div>

          {/* TBI (shown if there are visible TBI milestones OR user is admin) */}
          {(isAdmin || tbiMilestones.some(m => m.props?.['Visible on Dashboard'])) && (
            <div className="card p-5">
              <SectionHeader title="Truth Bible Institute"
                subtitle={`${tbiMilestones.filter(m=>m.props?.Status==='Completed').length} of ${tbiMilestones.length} complete`} />
              {tbiMilestones.length === 0
                ? <EmptyState icon="✦" message="No TBI milestones visible" />
                : tbiMilestones.map(m => (
                    <MilestoneRow key={m.id} milestone={m} isAdmin={isAdmin} onToggleVisibility={handleToggleMilestone} />
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
