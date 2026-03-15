import { useEffect, useState } from 'react'
import { getChapters, getPrograms, getGrants, getUpdateLog } from '../api/notion'
import { StatCard, CardSkeleton, SectionHeader, StatusBadge, SiadTags, ProgressBar } from '../components/shared/UI'
import { chapterProgress, wordCountProgress, formatDate, timeAgo, formatCurrency } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { RefreshCw } from 'lucide-react'

const GOLD = '#B8891A', TEAL = '#148585', CORAL = '#D4472E', SAGE = '#4E7D4C'

export default function OverviewPage() {
  const { isAdmin } = useAuth()
  const [chapters, setChapters] = useState([])
  const [programs, setPrograms] = useState([])
  const [grants, setGrants] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  async function load() {
    setLoading(true)
    try {
      const [ch, pr, gr, lg] = await Promise.allSettled([
        getChapters(), getPrograms(), getGrants(), getUpdateLog(5)
      ])
      if (ch.status === 'fulfilled') setChapters(ch.value?.results || [])
      if (pr.status === 'fulfilled') setPrograms(pr.value?.results || [])
      if (gr.status === 'fulfilled') setGrants(gr.value?.results || [])
      if (lg.status === 'fulfilled') setLog(lg.value?.results || [])
    } catch (e) { console.error(e) }
    setLoading(false)
    setLastRefresh(new Date())
  }

  useEffect(() => { load() }, [])

  const totalWords = chapters.reduce((s, c) => s + (c.props?.['Current Word Count'] || 0), 0)
  const goalWords  = chapters.reduce((s, c) => s + (c.props?.['Word Count Goal'] || 0), 0)
  const doneChapters = chapters.filter(c => c.props?.Status === 'Complete').length
  const activePrograms = programs.filter(p => p.props?.Status === 'Active').length
  const totalGrantAsk = grants.reduce((s, g) => s + (g.props?.['Amount Requested'] || 0), 0)
  const awardedGrants = grants.reduce((s, g) => s + (g.props?.['Amount Awarded'] || 0), 0)

  const chapterChartData = chapters.map(c => ({
    name: (c.props?.['Chapter Number'] || 'Ch').replace('Chapter ','Ch').replace('Introduction','Intro').replace('Conclusion','Conc'),
    progress: chapterProgress(c.props?.Status),
    words: c.props?.['Current Word Count'] || 0,
    goal: c.props?.['Word Count Goal'] || 0,
  }))

  const grantStages = ['Researching','Writing','Submitted','Awarded','Declined','On Hold']
  const grantPieData = grantStages.map(stage => ({
    name: stage,
    value: grants.filter(g => g.props?.Stage === stage).length,
  })).filter(d => d.value > 0)
  const pieColors = { Researching:'#6B6B8F', Writing:GOLD, Submitted:TEAL, Awarded:SAGE, Declined:CORAL, 'On Hold':'var(--text-muted)' }

  if (loading) return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-widest mb-1">Hampton University · School of Religion</p>
          <h1 className="text-4xl text-ink-100 leading-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
            Command Overview
          </h1>
          <p className="text-sm text-ink-400 mt-1">PhD in Public Theology & Community Engagement — SIAD Framework</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs text-ink-500 hover:text-ink-300 transition-colors font-mono">
          <RefreshCw size={12} />{timeAgo(lastRefresh)}
        </button>
      </div>

      <div className="flex gap-0.5 mb-8 rounded-full overflow-hidden h-1">
        {[[GOLD,40],[TEAL,25],[CORAL,20],[SAGE,15]].map(([c,w],i) => (
          <div key={i} className="h-full" style={{ width: `${w}%`, background: c }} />
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Chapters Complete" value={`${doneChapters}/${chapters.length}`} sub={`${Math.round(goalWords ? (totalWords/goalWords)*100 : 0)}% of word goal`} color={GOLD} icon="📚" />
        <StatCard label="Words Written" value={totalWords.toLocaleString()} sub={`of ${goalWords.toLocaleString()} goal`} color={TEAL} icon="✍" />
        <StatCard label="Active Programs" value={activePrograms} sub={`${programs.length} total at VOW Center`} color={SAGE} icon="⛪" />
        <StatCard label="Grant Pipeline" value={formatCurrency(totalGrantAsk)} sub={`${formatCurrency(awardedGrants)} awarded`} color={CORAL} icon="💰" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 animate-fade-up delay-1">
          <SectionHeader title="Dissertation Progress" subtitle="Chapter-by-chapter status" />
          <div className="space-y-4">
            {chapters.map(c => {
              const status = c.props?.Status || 'Not Started'
              const pct = chapterProgress(status)
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-ink-300 truncate flex-1 mr-2">{c.props?.['Chapter Title'] || 'Untitled'}</p>
                    <StatusBadge status={status} />
                  </div>
                  <ProgressBar value={pct} color={GOLD} height={3} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-6 animate-fade-up delay-2">
          <SectionHeader title="Word Count" subtitle="Current vs. goal by chapter" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chapterChartData} barGap={2} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid #32324A', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Bar dataKey="goal" fill="#1A1A24" stroke="#32324A" strokeWidth={1} radius={[2,2,0,0]} name="Goal" />
              <Bar dataKey="words" fill={GOLD} radius={[2,2,0,0]} name="Written" opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 animate-fade-up delay-3">
          <SectionHeader title="VOW Center" subtitle={`${programs.length} programs`} />
          <div className="space-y-3">
            {programs.slice(0,5).map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="min-w-0 mr-2">
                  <p className="text-xs text-ink-300 truncate">{p.props?.['Program Name']}</p>
                  <SiadTags pillars={p.props?.['SIAD Pillar'] || []} />
                </div>
                <StatusBadge status={p.props?.Status || 'Planned'} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-fade-up delay-4">
          <SectionHeader title="Grant Pipeline" subtitle={`${grants.length} opportunities`} />
          {grantPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <PieChart width={100} height={100}>
                <Pie data={grantPieData} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                  {grantPieData.map(entry => <Cell key={entry.name} fill={pieColors[entry.name] || 'var(--text-muted)'} />)}
                </Pie>
              </PieChart>
              <div className="space-y-1.5 flex-1">
                {grantPieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: pieColors[d.name] }} />
                      <p className="text-[10px] text-ink-400 font-mono">{d.name}</p>
                    </div>
                    <p className="text-[10px] text-ink-300 font-mono">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-600 text-center py-6 font-mono">No grants yet</p>
          )}
        </div>

        <div className="card p-6 animate-fade-up delay-5">
          <SectionHeader title="Recent Activity" subtitle="Update log" />
          <div className="space-y-3">
            {log.length === 0 && <p className="text-xs text-ink-600 font-mono text-center py-4">No entries yet</p>}
            {log.slice(0,5).map(entry => (
              <div key={entry.id} className="border-l-2 border-ink-700 pl-3 py-0.5 hover:border-gold-500 transition-colors">
                <p className="text-xs text-ink-300 leading-snug">{entry.props?.['Entry Title']}</p>
                <p className="text-[10px] text-ink-600 font-mono mt-0.5">
                  {timeAgo(entry.props?.['date:Date:start'])} · {entry.props?.['Entry Type']}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
