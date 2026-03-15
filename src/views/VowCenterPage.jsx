import { useEffect, useState } from 'react'
import { getPrograms, getMilestones, toggleProgramVisibility, updateProgramStatus, toggleMilestoneVisibility } from '../api/notion'
import { StatusBadge, SiadTags, SectionHeader, CardSkeleton, EmptyState, StatCard, Toggle } from '../components/shared/UI'
import { formatDate } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const STATUS_OPTS = ['Active','Launching','Planned','On Hold','Completed']

function ProgramCard({ program, isAdmin, onVisibilityToggle, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const p = program.props || {}
  const visible = p['Visible on Dashboard']

  return (
    <div className={`card transition-all duration-200 ${!visible && isAdmin ? 'opacity-50' : 'card-interactive'}`}
      style={!visible ? { borderStyle: 'dashed' } : {}}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-sm text-ink-200 font-medium">{p['Program Name'] || 'Unnamed'}</p>
              {p['Initiative Type'] && (
                <span className="text-[9px] font-mono text-ink-600 px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-raised)', border: '1px solid #32324A' }}>{p['Initiative Type']}</span>
              )}
            </div>
            <SiadTags pillars={p['SIAD Pillar'] || []} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <>
                <select value={p.Status || 'Planned'} disabled={updating}
                  onChange={async e => { setUpdating(true); await onStatusChange(program.id, e.target.value); setUpdating(false) }}
                  className="text-[10px] font-mono bg-ink-800 border border-ink-700 rounded-lg px-2 py-1 text-ink-300 outline-none cursor-pointer">
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={async () => { setUpdating(true); await onVisibilityToggle(program.id, !visible); setUpdating(false) }}
                  disabled={updating} title={visible ? 'Hide' : 'Show'}
                  className={`p-1.5 rounded-lg transition-colors ${visible ? 'text-teal-300' : 'text-ink-600 hover:text-ink-400'}`}>
                  {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </>
            ) : <StatusBadge status={p.Status || 'Planned'} />}
          </div>
        </div>
        {p['Description'] && <p className="text-xs text-ink-500 leading-relaxed mb-3">{p['Description']}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {p['Target Population'] && <p className="text-[10px] text-ink-600"><span className="text-ink-700 font-mono">Audience: </span>{p['Target Population']}</p>}
          {p['Enrollment Count'] > 0 && <p className="text-[10px] text-gold-500 font-mono">{p['Enrollment Count']} enrolled</p>}
          {p['Launch Date'] && <p className="text-[10px] text-ink-600 font-mono">Since {formatDate(p['Launch Date'])}</p>}
        </div>
        {isAdmin && p['Dissertation Connection'] && (
          <div className="mt-3 pt-3 border-t border-ink-800">
            <p className="text-[9px] font-mono text-gold-600 uppercase tracking-widest mb-1">Dissertation Link</p>
            <p className="text-[10px] text-ink-600">{p['Dissertation Connection']}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MilestoneRow({ milestone, isAdmin, onVisibilityToggle }) {
  const p = milestone.props || {}
  const visible = p['Visible on Dashboard']
  const dotColor = { Completed: '#6FA06C', Active: '#6FA06C', 'In Progress': '#D4A829', 'Not Started': 'var(--text-muted)', Blocked: '#E8705A', 'On Hold': '#9494AF' }[p.Status] || 'var(--text-muted)'
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-ink-800 last:border-0 transition-opacity ${!visible && isAdmin ? 'opacity-40' : ''}`}>
      <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-ink-300">{p['Milestone']}</p>
            {p['Organization'] && <p className="text-[9px] font-mono text-ink-600 mt-0.5">{p['Organization']}</p>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={p.Status || 'Not Started'} size="sm" />
            {isAdmin && (
              <button onClick={() => onVisibilityToggle(milestone.id, !visible)}
                className={`p-1 rounded transition-colors ${visible ? 'text-ink-500 hover:text-teal-300' : 'text-ink-700 hover:text-ink-500'}`}>
                {visible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
            )}
          </div>
        </div>
        {p['Notes'] && <p className="text-[10px] text-ink-600 mt-1 leading-relaxed">{p['Notes']}</p>}
      </div>
    </div>
  )
}

export default function VowCenterPage() {
  const { isAdmin } = useAuth()
  const [programs, setPrograms] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHidden, setShowHidden] = useState(false)
  const [orgFilter, setOrgFilter] = useState('All')

  async function load() {
    setLoading(true)
    try {
      const [pr, ms] = await Promise.allSettled([getPrograms(), getMilestones()])
      if (pr.status === 'fulfilled') setPrograms(pr.value?.results || [])
      if (ms.status === 'fulfilled') setMilestones(ms.value?.results || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const visiblePrograms = programs.filter(p => showHidden || p.props?.['Visible on Dashboard'])
  const filteredMilestones = milestones.filter(m =>
    (orgFilter === 'All' || m.props?.Organization === orgFilter) && (showHidden || m.props?.['Visible on Dashboard'])
  )

  async function handleProgramVisibility(id, v) {
    await toggleProgramVisibility(id, v)
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, props: { ...p.props, 'Visible on Dashboard': v } } : p))
  }
  async function handleProgramStatus(id, s) {
    await updateProgramStatus(id, s)
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, props: { ...p.props, Status: s } } : p))
  }
  async function handleMilestoneVisibility(id, v) {
    await toggleMilestoneVisibility(id, v)
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, props: { ...m.props, 'Visible on Dashboard': v } } : m))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-xs text-ink-500 font-mono uppercase tracking-widest mb-1">Verity Outreach Worship Center · Philadelphia, PA</p>
        <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>VOW Center Ops</h1>
        <p className="text-sm text-ink-400 mt-1">Programs · Truth Bible Institute · 501(c)(3) Journey</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Programs" value={programs.filter(p => p.props?.Status === 'Active').length} sub={`${programs.length} total`} color="#4E7D4C" />
          <StatCard label="Milestones Done" value={milestones.filter(m => m.props?.Status === 'Completed').length} sub={`of ${milestones.length}`} color="#148585" />
          <StatCard label="In Progress" value={milestones.filter(m => m.props?.Status === 'In Progress').length} sub="milestones active" color="#B8891A" />
          <StatCard label="Initiatives" value={programs.filter(p => p.props?.Status !== 'Completed').length} sub="ongoing" color="#D4472E" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <SectionHeader title="Programs & Initiatives" subtitle={`${visiblePrograms.length} showing`}
            action={isAdmin && <Toggle checked={showHidden} onChange={setShowHidden} label="Show hidden" />} />
          {loading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : visiblePrograms.length === 0
              ? <EmptyState icon="⛪" message="No programs to display." />
              : <div className="space-y-4">{visiblePrograms.map(p => (
                  <ProgramCard key={p.id} program={p} isAdmin={isAdmin}
                    onVisibilityToggle={handleProgramVisibility} onStatusChange={handleProgramStatus} />
                ))}</div>
          }
        </div>

        <div>
          <SectionHeader title="Org Milestones"
            action={
              <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
                className="text-[10px] font-mono bg-ink-800 border border-ink-700 rounded-lg px-2 py-1 text-ink-400 outline-none">
                {['All','VOW Center 501c3','Truth Bible Institute','General Ops'].map(o => <option key={o}>{o}</option>)}
              </select>
            } />
          {isAdmin && <div className="flex justify-end mb-3"><Toggle checked={showHidden} onChange={setShowHidden} label="Show hidden" /></div>}
          <div className="card p-5">
            {loading
              ? <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-8 w-full" />)}</div>
              : filteredMilestones.length === 0
                ? <EmptyState icon="◌" message="No milestones match filter." />
                : filteredMilestones.map(m => (
                    <MilestoneRow key={m.id} milestone={m} isAdmin={isAdmin} onVisibilityToggle={handleMilestoneVisibility} />
                  ))
            }
          </div>

          {!loading && (
            <div className="card p-4 mt-4">
              <p className="text-[9px] font-mono text-ink-600 uppercase tracking-widest mb-3">501(c)(3) Filing Progress</p>
              {['In Progress','Not Started','Completed','Blocked'].map(s => {
                const items = milestones.filter(m => m.props?.Organization === 'VOW Center 501c3')
                const count = items.filter(m => m.props?.Status === s).length
                const pct = items.length ? Math.round((count / items.length) * 100) : 0
                if (!count) return null
                const color = { Completed: '#6FA06C', 'In Progress': '#D4A829', Blocked: '#E8705A', 'Not Started': 'var(--text-muted)' }[s]
                return (
                  <div key={s} className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-mono text-ink-600 w-20 shrink-0">{s}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-ink-800">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-[9px] font-mono text-ink-500 w-4 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
