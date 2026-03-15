import { useEffect, useState } from 'react'
import { getGrants, createGrant, updateGrantStage } from '../api/notion'
import { StatusBadge, SiadTags, SectionHeader, CardSkeleton, Button, EmptyState, StatCard } from '../components/shared/UI'
import { formatDate, formatCurrency } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { Plus, ExternalLink, DollarSign } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STAGES = ['Researching','Writing','Submitted','Awarded','Declined','On Hold']
const STAGE_COLORS = { Researching: '#6B6B8F', Writing: '#B8891A', Submitted: '#148585', Awarded: '#4E7D4C', Declined: '#D4472E', 'On Hold': 'var(--text-muted)' }
const ALIGNMENTS = ['VOW Center Programs','Truth Bible Institute','Dissertation Research','General Operations','Youth Development']

function AddGrantForm({ onAdded, onCancel }) {
  const [form, setForm] = useState({ name: '', funder: '', stage: 'Researching', amount: '', alignment: [], notes: '', website: '', deadline: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleAlign = (a) => setForm(f => ({
    ...f, alignment: f.alignment.includes(a) ? f.alignment.filter(x => x !== a) : [...f.alignment, a]
  }))

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await createGrant({
        'Grant Name': form.name, 'Funder': form.funder, 'Stage': form.stage,
        'Amount Requested': form.amount ? parseFloat(form.amount) : null,
        'Alignment': form.alignment, 'Proposal Notes': form.notes,
        'Funder Website': form.website || null,
        ...(form.deadline ? { 'date:Deadline:start': form.deadline, 'date:Deadline:is_datetime': 0 } : {}),
        'Visible on Dashboard': '__YES__',
      })
      onAdded?.()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="card p-6 space-y-4 animate-fade-up" style={{ borderColor: 'rgba(184,137,26,0.25)' }}>
      <p className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">New Grant Opportunity</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Grant / opportunity name *"
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
        </div>
        <input value={form.funder} onChange={e => set('funder', e.target.value)} placeholder="Funder organization"
          className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
        <input value={form.amount} onChange={e => set('amount', e.target.value)} type="number" placeholder="Amount requested ($)"
          className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
        <select value={form.stage} onChange={e => set('stage', e.target.value)}
          className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-300 outline-none">
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={form.deadline} onChange={e => set('deadline', e.target.value)} type="date"
          className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-300 outline-none" />
        <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="Funder website URL"
          className="col-span-2 bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
      </div>
      <div>
        <p className="text-[9px] font-mono text-ink-600 uppercase tracking-widest mb-2">Alignment</p>
        <div className="flex flex-wrap gap-2">
          {ALIGNMENTS.map(a => (
            <button key={a} onClick={() => toggleAlign(a)}
              className="text-[10px] px-3 py-1 rounded-full font-mono transition-all"
              style={form.alignment.includes(a)
                ? { background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.4)', color: '#E8C547' }
                : { background: 'var(--bg-surface)', border: '1px solid #32324A', color: 'var(--text-muted)' }}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Proposal notes, strategy, contacts..." rows={2}
        className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none resize-none focus:border-gold-500/50" />
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving || !form.name.trim()} size="sm">{saving ? 'Saving...' : 'Add Grant'}</Button>
        <Button onClick={onCancel} variant="ghost" size="sm">Cancel</Button>
      </div>
    </div>
  )
}

function GrantCard({ grant, isAdmin, onStageChange }) {
  const p = grant.props || {}
  const stage = p.Stage || 'Researching'
  const stageColor = STAGE_COLORS[stage] || '#6B6B8F'

  return (
    <div className="card card-interactive p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-200 font-medium">{p['Grant Name']}</p>
          {p['Funder'] && <p className="text-xs text-ink-500 mt-0.5">{p['Funder']}</p>}
        </div>
        <div className="shrink-0">
          {isAdmin ? (
            <select value={stage} onChange={e => onStageChange(grant.id, e.target.value)}
              className="text-[10px] font-mono bg-ink-800 border border-ink-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
              style={{ color: stageColor }}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          ) : <StatusBadge status={stage} />}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        {p['Amount Requested'] && (
          <div className="flex items-center gap-1 text-gold-400">
            <DollarSign size={11} />
            <span className="text-xs font-mono">{formatCurrency(p['Amount Requested'])}</span>
          </div>
        )}
        {p['Amount Awarded'] > 0 && (
          <span className="text-xs font-mono text-sage-300">✓ {formatCurrency(p['Amount Awarded'])} awarded</span>
        )}
        {p['date:Deadline:start'] && (
          <span className="text-[10px] font-mono text-ink-500">Deadline: {formatDate(p['date:Deadline:start'])}</span>
        )}
      </div>

      {p['Alignment'] && p['Alignment'].length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {p['Alignment'].map(a => (
            <span key={a} className="text-[9px] px-2 py-0.5 rounded font-mono text-ink-500"
              style={{ background: 'var(--bg-surface)', border: '1px solid #32324A' }}>{a}</span>
          ))}
        </div>
      )}

      {p['Proposal Notes'] && <p className="text-[11px] text-ink-600 leading-relaxed mb-2">{p['Proposal Notes']}</p>}

      {p['Funder Website'] && (
        <a href={p['Funder Website']} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-gold-500 hover:text-gold-300 transition-colors font-mono">
          <ExternalLink size={10} /> Visit funder site
        </a>
      )}
    </div>
  )
}

export default function GrantsPage() {
  const { isAdmin } = useAuth()
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [stageFilter, setStageFilter] = useState('All')

  async function load() {
    setLoading(true)
    try {
      const res = await getGrants()
      setGrants(res?.results || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStageChange(id, stage) {
    await updateGrantStage(id, stage)
    setGrants(prev => prev.map(g => g.id === id ? { ...g, props: { ...g.props, Stage: stage } } : g))
  }

  const filtered = stageFilter === 'All' ? grants : grants.filter(g => g.props?.Stage === stageFilter)
  const totalAsk = grants.reduce((s, g) => s + (g.props?.['Amount Requested'] || 0), 0)
  const totalAwarded = grants.reduce((s, g) => s + (g.props?.['Amount Awarded'] || 0), 0)

  const pieData = STAGES.map(s => ({
    name: s, value: grants.filter(g => g.props?.Stage === s).length
  })).filter(d => d.value > 0)

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-widest mb-1">VOW Center · Dissertation Research</p>
          <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>Grant Pipeline</h1>
          <p className="text-sm text-ink-400 mt-1">Funders · Proposals · Award tracking · Future contractor infrastructure</p>
        </div>
        {isAdmin && !showAdd && <Button onClick={() => setShowAdd(true)}><Plus size={14} />Add Grant</Button>}
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Pipeline" value={formatCurrency(totalAsk)} sub={`${grants.length} opportunities`} color="#B8891A" />
          <StatCard label="Awarded" value={formatCurrency(totalAwarded)} sub="confirmed funding" color="#4E7D4C" />
          <StatCard label="In Progress" value={grants.filter(g => ['Writing','Submitted'].includes(g.props?.Stage)).length} sub="active proposals" color="#148585" />
          <StatCard label="Researching" value={grants.filter(g => g.props?.Stage === 'Researching').length} sub="prospects identified" color="#6B6B8F" />
        </div>
      )}

      {showAdd && <div className="mb-6"><AddGrantForm onAdded={() => { load(); setShowAdd(false) }} onCancel={() => setShowAdd(false)} /></div>}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <SectionHeader title="Opportunities" subtitle={`${filtered.length} showing`}
            action={
              <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                className="text-[10px] font-mono bg-ink-800 border border-ink-700 rounded-lg px-2 py-1 text-ink-400 outline-none">
                {['All', ...STAGES].map(s => <option key={s}>{s}</option>)}
              </select>
            } />
          {loading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : filtered.length === 0
              ? <EmptyState icon="💰" message="No grant opportunities yet. Add your first funder above."
                  cta={isAdmin && !showAdd && <Button onClick={() => setShowAdd(true)} size="sm"><Plus size={12} />Add Grant</Button>} />
              : <div className="space-y-4">{filtered.map(g => (
                  <GrantCard key={g.id} grant={g} isAdmin={isAdmin} onStageChange={handleStageChange} />
                ))}</div>
          }
        </div>

        <div>
          <SectionHeader title="Pipeline" subtitle="By stage" />
          {grants.length > 0 ? (
            <div className="card p-5">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" strokeWidth={0}>
                    {pieData.map(entry => <Cell key={entry.name} fill={STAGE_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid #32324A', fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between cursor-pointer"
                    onClick={() => setStageFilter(stageFilter === d.name ? 'All' : d.name)}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[d.name] }} />
                      <span className="text-[10px] font-mono text-ink-400">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-300">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <EmptyState icon="◌" message="Pipeline chart appears once you add grants." />
            </div>
          )}

          <div className="card p-5 mt-4">
            <p className="text-[9px] font-mono text-ink-600 uppercase tracking-widest mb-3">Future Contractor Notes</p>
            <p className="text-[10px] text-ink-500 leading-relaxed">
              This pipeline is designed to scale into a professional grant writing practice or contractor role. Each opportunity includes contractor notes, funder relationships, and replicable proposal strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
