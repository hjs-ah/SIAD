import { useEffect, useState, useRef } from 'react'
import { getChapters, updateChapter, getUpdateLog, addLogEntry } from '../api/notion'
import { askResearchBar } from '../api/anthropic'
import {
  StatusBadge, SiadTags, ProgressBar, SectionHeader,
  CardSkeleton, Button, EmptyState, StatCard
} from '../components/shared/UI'
import { chapterProgress, wordCountProgress, formatDate, timeAgo, getStatus } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { Send, Sparkles, Plus, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react'

const GOLD = '#B8891A'
const STATUS_OPTIONS = ['Not Started','Outlining','Drafting','In Review','Revising','Complete']

function AIResearchBar() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreaming('')
    try {
      let full = ''
      await askResearchBar(newMessages, (chunk, fullText) => {
        full = fullText
        setStreaming(fullText)
      })
      setMessages(prev => [...prev, { role: 'assistant', content: full }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${err.message}` }])
    } finally {
      setLoading(false)
      setStreaming('')
      inputRef.current?.focus()
    }
  }

  const PROMPTS = [
    'How does anchor institution theory apply to Black churches?',
    'Contrast Harris and Jones on Black church social ministry',
    'Help me develop the Discipleship pillar of SIAD',
    'What scholars engage Black youth development theologically?',
  ]

  return (
    <div className="card ai-glow flex flex-col" style={{ minHeight: 380 }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-800">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.3)' }}>
          <Sparkles size={13} className="text-gold-300" />
        </div>
        <div>
          <p className="text-sm text-ink-200 font-medium">AI Research Bar</p>
          <p className="text-[10px] text-ink-500 font-mono">Claude Opus · SIAD-grounded · Hampton context</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
          <span className="text-[9px] font-mono text-ink-600">online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 300 }}>
        {messages.length === 0 && !loading && (
          <div className="py-6">
            <p className="text-xs text-ink-500 text-center mb-4">Ask anything grounded in your dissertation research.</p>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-[10px] px-3 py-1.5 rounded-full text-ink-400 hover:text-gold-300 transition-colors font-mono text-left"
                  style={{ background: 'rgba(184,137,26,0.06)', border: '1px solid rgba(184,137,26,0.15)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[86%] rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { background: 'rgba(184,137,26,0.15)', border: '1px solid rgba(184,137,26,0.25)', color: '#E8E8F0' }
                : { background: 'var(--bg-surface)', border: '1px solid #242432', color: 'var(--text-tertiary)' }}>
              {msg.role === 'assistant' && (
                <span className="text-[9px] font-mono text-gold-500 block mb-1.5 tracking-widest">CLAUDE OPUS</span>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && streaming && (
          <div className="flex justify-start">
            <div className="max-w-[86%] rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ background: 'var(--bg-surface)', border: '1px solid #242432', color: 'var(--text-tertiary)' }}>
              <span className="text-[9px] font-mono text-gold-500 block mb-1.5 tracking-widest">CLAUDE OPUS</span>
              <p className="whitespace-pre-wrap">{streaming}
                <span className="inline-block w-1 h-4 bg-gold-500 animate-pulse ml-0.5 align-middle" />
              </p>
            </div>
          </div>
        )}
        {loading && !streaming && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-surface)', border: '1px solid #242432' }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 pb-4 pt-3 border-t border-ink-800">
        <div className="flex gap-2">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask a research question..." rows={2}
            className="flex-1 bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm
                       text-ink-200 placeholder-ink-600 outline-none resize-none
                       focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-3 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: 'rgba(184,137,26,0.1)', border: '1px solid rgba(184,137,26,0.2)', color: '#E8C547' }}>
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] text-ink-700 mt-1.5 font-mono">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

function ChapterCard({ chapter, isAdmin, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const p = chapter.props || {}
  const status = p.Status || 'Not Started'

  async function changeStatus(newStatus) {
    setUpdating(true)
    await onStatusChange(chapter.id, newStatus)
    setUpdating(false)
  }

  return (
    <div className={`card transition-all duration-200 ${expanded ? 'border-gold-500/30' : 'card-interactive'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-[10px] font-mono text-ink-600 mt-0.5 w-8 shrink-0">
              {(p['Chapter Number'] || '').replace('Chapter ','Ch ').replace('Introduction','Intro').replace('Conclusion','Conc')}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink-200 font-medium leading-snug">{p['Chapter Title'] || 'Untitled'}</p>
              <div className="mt-1.5"><SiadTags pillars={p['SIAD Pillar'] || []} /></div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <select value={status} onChange={e => changeStatus(e.target.value)} disabled={updating}
                className="text-[10px] font-mono bg-ink-800 border border-ink-700 rounded-lg px-2 py-1
                           outline-none hover:border-gold-500/50 transition-colors cursor-pointer"
                style={{ color: getStatus(status).text }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : <StatusBadge status={status} />}
            <button onClick={() => setExpanded(!expanded)} className="p-1 text-ink-600 hover:text-ink-300 transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[9px] font-mono text-ink-600 mb-1">
              <span>Stage progress</span><span>{chapterProgress(status)}%</span>
            </div>
            <ProgressBar value={chapterProgress(status)} color={GOLD} height={3} />
          </div>
          {p['Word Count Goal'] > 0 && (
            <div>
              <div className="flex justify-between text-[9px] font-mono text-ink-600 mb-1">
                <span>Words</span>
                <span>{(p['Current Word Count'] || 0).toLocaleString()} / {p['Word Count Goal'].toLocaleString()}</span>
              </div>
              <ProgressBar value={wordCountProgress(p['Current Word Count'], p['Word Count Goal'])} color="#148585" height={3} />
            </div>
          )}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-ink-800 space-y-3 animate-fade-in">
            {p['Key Arguments'] && (
              <div>
                <p className="text-[9px] font-mono text-ink-600 uppercase tracking-widest mb-1">Key Arguments</p>
                <p className="text-xs text-ink-400 leading-relaxed">{p['Key Arguments']}</p>
              </div>
            )}
            {p['Notes'] && (
              <div>
                <p className="text-[9px] font-mono text-ink-600 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs text-ink-400 leading-relaxed">{p['Notes']}</p>
              </div>
            )}
            {p['Advisor Feedback'] && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(20,133,133,0.08)', border: '1px solid rgba(20,133,133,0.2)' }}>
                <p className="text-[9px] font-mono text-teal-200 uppercase tracking-widest mb-1">Advisor Feedback</p>
                <p className="text-xs text-ink-400 leading-relaxed">{p['Advisor Feedback']}</p>
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {p['Target Date'] && (
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock size={11} /><span className="font-mono">{formatDate(p['Target Date'])}</span>
                </div>
              )}
              {p['File Link'] && (
                <a href={p['File Link']} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors">
                  <FileText size={11} /><span>Open document</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddLogEntry({ onAdded }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Writing Session', chapter: 'General', words: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addLogEntry({
        'Entry Title': form.title, 'Entry Type': form.type, 'Related Chapter': form.chapter,
        'Word Count Added': form.words ? parseInt(form.words) : 0,
        'Session Notes': form.notes,
        'date:Date:start': new Date().toISOString().split('T')[0],
        'date:Date:is_datetime': 0, 'Visible to Committee': '__YES__',
      })
      setForm({ title: '', type: 'Writing Session', chapter: 'General', words: '', notes: '' })
      setOpen(false)
      onAdded?.()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (!open) return <Button onClick={() => setOpen(true)} variant="secondary" size="sm"><Plus size={12} />Log Entry</Button>

  return (
    <div className="card p-5 space-y-3 animate-fade-up" style={{ borderColor: 'rgba(184,137,26,0.25)' }}>
      <p className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">New Log Entry</p>
      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Entry title..."
        className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
      <div className="grid grid-cols-2 gap-3">
        {[
          ['type', ['Writing Session','Research','Advisor Meeting','Milestone','Revision','Submission']],
          ['chapter', ['Introduction','Chapter 1','Chapter 2','Chapter 3','Chapter 4','Chapter 5','Conclusion','General']],
        ].map(([k, opts]) => (
          <select key={k} value={form[k]} onChange={e => set(k, e.target.value)}
            className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-xs text-ink-300 outline-none">
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>
      <input value={form.words} onChange={e => set('words', e.target.value)} type="number" placeholder="Words added (optional)"
        className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none focus:border-gold-500/50" />
      <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Session notes..." rows={2}
        className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 outline-none resize-none focus:border-gold-500/50" />
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving || !form.title.trim()} size="sm">{saving ? 'Saving...' : 'Save Entry'}</Button>
        <Button onClick={() => setOpen(false)} variant="ghost" size="sm">Cancel</Button>
      </div>
    </div>
  )
}

export default function DissertationPage() {
  const { isAdmin } = useAuth()
  const [chapters, setChapters] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [ch, lg] = await Promise.allSettled([getChapters(), getUpdateLog()])
      if (ch.status === 'fulfilled') setChapters(ch.value?.results || [])
      if (lg.status === 'fulfilled') setLog(lg.value?.results || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(pageId, newStatus) {
    await updateChapter(pageId, { Status: newStatus })
    setChapters(prev => prev.map(c => c.id === pageId ? { ...c, props: { ...c.props, Status: newStatus } } : c))
  }

  const totalWords = chapters.reduce((s, c) => s + (c.props?.['Current Word Count'] || 0), 0)
  const goalWords = chapters.reduce((s, c) => s + (c.props?.['Word Count Goal'] || 0), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-xs text-ink-500 font-mono uppercase tracking-widest mb-1">Hampton University · School of Religion</p>
        <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>Dissertation Hub</h1>
        <p className="text-sm text-ink-400 mt-1">PhD in Public Theology & Community Engagement</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Overall Progress" value={`${goalWords ? Math.round((totalWords/goalWords)*100) : 0}%`} sub="of word goal" color={GOLD} />
          <StatCard label="Words Written" value={totalWords.toLocaleString()} sub={`of ${goalWords.toLocaleString()}`} color="#148585" />
          <StatCard label="In Progress" value={chapters.filter(c => ['Outlining','Drafting','In Review','Revising'].includes(c.props?.Status)).length} sub="chapters active" color="#4E7D4C" />
          <StatCard label="Complete" value={chapters.filter(c => c.props?.Status === 'Complete').length} sub={`of ${chapters.length} total`} color={GOLD} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <SectionHeader title="Chapters" subtitle="Expand any chapter for detail" />
          {loading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : <div className="space-y-3">{chapters.map(ch => <ChapterCard key={ch.id} chapter={ch} isAdmin={isAdmin} onStatusChange={handleStatusChange} />)}</div>
          }
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeader title="Research Assistant" subtitle="Powered by Claude Opus" />
            <AIResearchBar />
          </div>
          <div>
            <SectionHeader title="Writing Log" subtitle={`${log.length} entries`}
              action={isAdmin && <AddLogEntry onAdded={load} />} />
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {log.length === 0
                ? <EmptyState icon="✍" message="No log entries yet. Start recording your writing sessions." />
                : log.map(entry => (
                  <div key={entry.id} className="card p-4 hover:border-gold-500/20 transition-colors">
                    <p className="text-xs text-ink-300 font-medium">{entry.props?.['Entry Title']}</p>
                    {entry.props?.['Session Notes'] && (
                      <p className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">{entry.props['Session Notes']}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[9px] font-mono text-ink-600">{timeAgo(entry.props?.['date:Date:start'])}</span>
                      {entry.props?.['Entry Type'] && <StatusBadge status={entry.props['Entry Type']} size="sm" />}
                      {entry.props?.['Word Count Added'] > 0 && (
                        <span className="text-[9px] font-mono text-gold-500">+{entry.props['Word Count Added'].toLocaleString()} words</span>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
