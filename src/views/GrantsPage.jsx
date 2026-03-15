import { useEffect, useState } from 'react'
import { getGrants, createGrant, updateGrantStage } from '../../api/notion'
import {
  StatusBadge, SiadTags, SectionHeader, CardSkeleton,
  Button, EmptyState, StatCard
} from '../../components/shared/UI'
import { formatCurrency, formatDate, getStatus } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { Plus, X, RefreshCw, ExternalLink } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const STAGES = ['Researching','Writing','Submitted','Awarded','Declined','On Hold']
const STAGE_COLORS = {
  Researching:'#6B6B8F', Writing:'#B8891A', Submitted:'#148585',
  Awarded:'#4E7D4C', Declined:'#D4472E', 'On Hold':'#4A4A6A'
}
const ALIGNMENTS = ['VOW Center Programs','Truth Bible Institute','Dissertation Research','General Operations','Youth Development']

// ─── Add Grant Modal ──────────────────────────────────────────────────────────
function AddGrantModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    'Grant Name': '', Funder: '', Stage: 'Researching',
    'Amount Requested': '', Alignment: [], 'SIAD Pillar': [],
    'Funder Website': '', 'Point of Contact': '', 'Proposal Notes': '',
    'Future Contractor Notes': '',
  })
  const [saving, setSaving] = useState(false)

  function toggle(field, val) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val]
    }))
  }

  async function handleSave() {
    if (!form['Grant Name'].trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up"
        style={{ border: '1px solid #32324A' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-800">
          <h3 className="text-lg text-ink-100" style={{ fontFamily: 'var(--font-display)' }}>New Grant Opportunity</h3>
          <button onClick={onClose} className="text-ink-600 hover:text-ink-300 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Grant name */}
          <div>
            <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Grant / Program Name *</label>
            <input value={form['Grant Name']} onChange={e => setForm(f=>({...f,'Grant Name':e.target.value}))}
              placeholder="e.g. Lilly Endowment Youth Ministry Grant"
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-200
                         placeholder-ink-600 outline-none focus:border-gold-500 transition-colors" />
          </div>
          {/* Funder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Funder</label>
              <input value={form.Funder} onChange={e => setForm(f=>({...f,Funder:e.target.value}))}
                placeholder="Organization name"
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-200
                           placeholder-ink-600 outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Amount Requested</label>
              <input value={form['Amount Requested']} onChange={e => setForm(f=>({...f,'Amount Requested':e.target.value}))}
                placeholder="$0"
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-200
                           placeholder-ink-600 outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>
          {/* Stage */}
          <div>
            <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Stage</label>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(s => (
                <button key={s} onClick={() => setForm(f=>({...f,Stage:s}))}
                  className="text-[10px] px-2.5 py-1 rounded-full font-mono transition-all"
                  style={{
                    background: form.Stage===s ? `${STAGE_COLORS[s]}30` : 'transparent',
                    color: form.Stage===s ? getStatus(s).text : '#6B6B8F',
                    border: `1px solid ${form.Stage===s ? STAGE_COLORS[s]+'60' : '#32324A'}`,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Alignment */}
          <div>
            <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Alignment</label>
            <div className="flex flex-wrap gap-1.5">
              {ALIGNMENTS.map(a => (
                <button key={a} onClick={() => toggle('Alignment', a)}
                  className="text-[10px] px-2.5 py-1 rounded-full font-mono transition-all"
                  style={{
                    background: form.Alignment.includes(a) ? 'rgba(184,137,26,0.2)' : 'transparent',
                    color: form.Alignment.includes(a) ? '#E8C547' : '#6B6B8F',
                    border: `1px solid ${form.Alignment.includes(a) ? 'rgba(184,137,26,0.4)' : '#32324A'}`,
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Proposal Notes</label>
            <textarea value={form['Proposal Notes']} onChange={e => setForm(f=>({...f,'Proposal Notes':e.target.value}))}
              placeholder="Requirements, deadlines, strategy…"
              rows={3}
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-200
                         placeholder-ink-600 outline-none resize-none focus:border-gold-500 transition-colors" />
          </div>
          {/* Contractor notes */}
          <div>
            <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">
              Future Contractor Notes
              <span className="ml-1 normal-case text-ink-700">(for replication)</span>
            </label>
            <textarea value={form['Future Contractor Notes']} onChange={e => setForm(f=>({...f,'Future Contractor Notes':e.target.value}))}
              placeholder="What would you tell a future grant writer about this opportunity?"
              rows={2}
              className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-200
                         placeholder-ink-600 outline-none resize-none focus:border-gold-500 transition-colors" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-ink-800 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form['Grant Name'].trim() || saving}>
            {saving ? 'Saving…' : 'Add Grant'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GrantsPage() {
  const { isAdmin } = useAuth()
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [stageFilter, setStageFilter] = useState('all')

  async function load() {
    setLoading(true)
    const result = await getGrants()
    setGrants(result?.results || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSaveGrant(form) {
    await createGrant({
      'Grant Name': form['Grant Name'],
      Funder: form.Funder,
      Stage: form.Stage,
      'Amount Requested': parseFloat(form['Amount Requested'].replace(/[^0-9.]/g,'')) || 0,
      Alignment: form.Alignment,
      'Proposal Notes': form['Proposal Notes'],
      'Future Contractor Notes': form['Future Contractor Notes'],
    })
    await load()
  }

  async function handleStageChange(id, stage) {
    await updateGrantStage(id, stage)
    setGrants(prev => prev.map(g => g.id === id ? { ...g, props: { ...g.props, Stage: stage } } : g))
  }

  const filtered = stageFilter === 'all' ? grants : grants.filter(g => g.props?.Stage === stageFilter)
  const totalAsk = grants.reduce((s, g) => s + (g.props?.['Amount Requested'] || 0), 0)
  const awarded = grants.reduce((s, g) => s + (g.props?.['Amount Awarded'] || 0), 0)
  const submitted = grants.filter(g => g.props?.Stage === 'Submitted').length
  const active = grants.filter(g => ['Writing','Submitted'].includes(g.props?.Stage)).length

  const pieData = STAGES.map(s => ({
    name: s, value: grants.filter(g => g.props?.Stage === s).length
  })).filter(d => d.value > 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1">VOW Center & Dissertation</p>
          <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            Grant Pipeline
          </h1>
          <p className="text-sm text-ink-400 mt-1">Funders · Opportunities · Future practice</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={14} /> New Opportunity
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pipeline" value={formatCurrency(totalAsk)} sub={`${grants.length} opportunities`} color="#B8891A" icon="$" />
        <StatCard label="Awarded" value={formatCurrency(awarded)} sub="confirmed funding" color="#4E7D4C" icon="✓" />
        <StatCard label="Active" value={active} sub="writing or submitted" color="#148585" icon="→" />
        <StatCard label="Submitted" value={submitted} sub="awaiting decision" color="#D4472E" icon="◎" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grant list */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Opportunities"
            subtitle={`${filtered.length} grants`}
            action={
              <div className="flex items-center gap-2">
                <button onClick={load} className="text-ink-600 hover:text-ink-400"><RefreshCw size={14} /></button>
                <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                  className="bg-ink-800 border border-ink-700 rounded-lg px-2 py-1.5 text-xs text-ink-300 outline-none">
                  <option value="all">All stages</option>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            }
          />
          {loading ? [1,2,3].map(i => <CardSkeleton key={i} />) :
           filtered.length === 0 ? (
            <EmptyState icon="$" message="No grants yet — add your first opportunity"
              cta={isAdmin && <Button onClick={() => setShowAdd(true)}><Plus size={14} /> Add Grant</Button>} />
           ) : filtered.map(g => {
            const p = g.props
            const stage = p?.Stage || 'Researching'
            const cfg = getStatus(stage)
            return (
              <div key={g.id} className="card card-interactive p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm text-ink-100 mb-0.5" style={{ fontFamily: 'var(--font-display)', fontSize:'1rem' }}>
                      {p?.['Grant Name'] || 'Untitled'}
                    </h3>
                    <p className="text-xs text-ink-500">{p?.Funder || 'Unknown funder'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={stage} />
                    {p?.['Amount Requested'] && (
                      <p className="text-xs text-gold-400 font-mono mt-1">{formatCurrency(p['Amount Requested'])}</p>
                    )}
                  </div>
                </div>
                {p?.Alignment?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(Array.isArray(p.Alignment) ? p.Alignment : [p.Alignment]).map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                        style={{ background: 'rgba(74,74,106,0.2)', color: '#9494AF', border: '1px solid #32324A' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {p?.['Proposal Notes'] && (
                  <p className="text-xs text-ink-500 leading-relaxed mb-3 line-clamp-2">{p['Proposal Notes']}</p>
                )}
                {p?.Deadline && (
                  <p className="text-[10px] text-ink-700 font-mono mb-3">Deadline: {formatDate(p.Deadline)}</p>
                )}
                {/* Admin stage changer */}
                {isAdmin && (
                  <div className="flex flex-wrap gap-1 pt-3 border-t border-ink-800">
                    {STAGES.map(s => (
                      <button key={s} onClick={() => handleStageChange(g.id, s)}
                        className="text-[10px] px-2 py-0.5 rounded-full font-mono transition-all"
                        style={{
                          background: stage===s ? `${STAGE_COLORS[s]}25` : 'transparent',
                          color: stage===s ? getStatus(s).text : '#4A4A6A',
                          border: `1px solid ${stage===s ? STAGE_COLORS[s]+'50' : '#32324A'}`,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right: funnel viz + notes */}
        <div className="space-y-6">
          {/* Pipeline funnel */}
          <div className="card p-5">
            <SectionHeader title="Pipeline View" subtitle="by stage" />
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                      {pieData.map(d => <Cell key={d.name} fill={STAGE_COLORS[d.name]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background:'#1A1A24', border:'1px solid #32324A', borderRadius:8, fontSize:11 }}
                      itemStyle={{ color:'#C4C4D4' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[d.name] }} />
                        <span className="text-[10px] text-ink-400 font-mono">{d.name}</span>
                      </div>
                      <span className="text-[10px] text-ink-300 font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-ink-600 text-center py-8 font-mono">No grants to display</p>
            )}
          </div>

          {/* Future practice note */}
          <div className="card p-5" style={{ border: '1px solid rgba(184,137,26,0.15)' }}>
            <p className="text-[10px] font-mono text-gold-600 uppercase tracking-widest mb-2">Future Practice</p>
            <p className="text-xs text-ink-400 leading-relaxed">
              This pipeline is designed to scale into a grant writing role or consulting practice.
              Use <span className="text-ink-300">Future Contractor Notes</span> on each record to document
              strategy and lessons for future replication.
            </p>
          </div>
        </div>
      </div>

      {showAdd && <AddGrantModal onClose={() => setShowAdd(false)} onSave={handleSaveGrant} />}
    </div>
  )
}
