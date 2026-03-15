import { useEffect, useState, useRef } from 'react'
import { getChapters, getUpdateLog, addLogEntry, updateChapter } from '../../api/notion'
import { askResearchBar } from '../../api/anthropic'
import {
  StatusBadge, SiadTags, ProgressBar, SectionHeader,
  CardSkeleton, Button, EmptyState, StatCard
} from '../../components/shared/UI'
import {
  chapterProgress, wordCountProgress, formatDate,
  timeAgo, getStatus
} from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { Send, Sparkles, BookOpen, PenLine, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const GOLD = '#B8891A'

// ─── AI Research Bar ──────────────────────────────────────────────────────────
function ResearchBar() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function send() {
    if (!input.trim() || streaming) return
    const userMsg = { role: 'user', content: input }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setStreaming(true)
    setStreamText('')

    try {
      let full = ''
      await askResearchBar(
        newHistory.map(m => ({ role: m.role, content: m.content })),
        (chunk, accumulated) => {
          full = accumulated
          setStreamText(accumulated)
        }
      )
      setMessages(prev => [...prev, { role: 'assistant', content: full }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠ Unable to reach the research assistant. Check your API configuration.'
      }])
    }
    setStreamText('')
    setStreaming(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const allMessages = streaming
    ? [...messages, { role: 'assistant', content: streamText, streaming: true }]
    : messages

  return (
    <div className="card p-0 overflow-hidden" style={{ border: '1px solid rgba(184,137,26,0.2)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-800"
        style={{ background: 'rgba(184,137,26,0.05)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.3)' }}>
          <Sparkles size={14} className="text-gold-300" />
        </div>
        <div>
          <p className="text-sm text-gold-300 font-medium">AI Research Assistant</p>
          <p className="text-[10px] text-ink-500 font-mono">Claude Opus · SIAD context loaded · Hampton University</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}
            className="ml-auto text-[10px] text-ink-600 hover:text-ink-400 font-mono transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="px-5 py-4 space-y-4 max-h-96 overflow-y-auto min-h-[120px]">
        {allMessages.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-xs text-ink-500 mb-3">Ask anything about your dissertation, SIAD framework, or research</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'How can I strengthen the SIAD framework argument in Chapter 2?',
                'What scholars should I engage on anchor institution theory?',
                'Help me outline the methodology for VOW Center case study',
              ].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-[10px] px-3 py-1.5 rounded-full text-ink-400 hover:text-gold-300 transition-colors"
                  style={{ background: 'rgba(184,137,26,0.08)', border: '1px solid rgba(184,137,26,0.15)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {allMessages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5
              ${msg.role === 'user'
                ? 'bg-ink-700 text-ink-300'
                : 'text-gold-300'}`}
              style={msg.role === 'assistant' ? { background: 'rgba(184,137,26,0.2)', border: '1px solid rgba(184,137,26,0.3)' } : {}}>
              {msg.role === 'user' ? 'A' : '✦'}
            </div>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-ink-800 text-ink-200'
                : 'text-ink-200'}`}
              style={msg.role === 'assistant' ? { background: 'rgba(184,137,26,0.06)', border: '1px solid rgba(184,137,26,0.1)' } : {}}>
              <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}
                {msg.streaming && <span className="inline-block w-1 h-3 bg-gold-400 ml-1 animate-pulse rounded-sm" />}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-ink-800 ai-glow">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your dissertation, SIAD framework, sources, arguments…"
            rows={2}
            disabled={streaming}
            className="flex-1 bg-transparent text-sm text-ink-200 placeholder-ink-600 outline-none resize-none
                       disabled:opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <button onClick={send} disabled={!input.trim() || streaming}
            className="self-end p-2 rounded-lg transition-all active:scale-95 disabled:opacity-40"
            style={{ background: input.trim() ? '#B8891A' : '#242432', color: input.trim() ? '#0A0A0F' : '#4A4A6A' }}>
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] text-ink-700 font-mono mt-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────
function ChapterCard({ chapter, onStatusChange, isAdmin }) {
  const [expanded, setExpanded] = useState(false)
  const p = chapter.props
  const status = p?.Status || 'Not Started'
  const pct = chapterProgress(status)
  const wPct = wordCountProgress(p?.['Current Word Count'], p?.['Word Count Goal'])

  return (
    <div className="card card-interactive animate-fade-up">
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-ink-600 shrink-0">
                {p?.['Chapter Number'] || '—'}
              </span>
              <h3 className="text-sm text-ink-200 leading-snug truncate"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                {p?.['Chapter Title'] || 'Untitled'}
              </h3>
            </div>
            <SiadTags pillars={p?.['SIAD Pillar'] || []} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={status} />
            {expanded ? <ChevronUp size={14} className="text-ink-600" /> : <ChevronDown size={14} className="text-ink-600" />}
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-ink-600 font-mono">Stage progress</span>
            <span className="text-[10px] text-ink-500 font-mono">{pct}%</span>
          </div>
          <ProgressBar value={pct} color={GOLD} height={3} />
          {(p?.['Word Count Goal'] > 0) && (
            <>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-ink-600 font-mono">
                  {(p?.['Current Word Count'] || 0).toLocaleString()} / {p?.['Word Count Goal']?.toLocaleString()} words
                </span>
                <span className="text-[10px] text-ink-500 font-mono">{wPct}%</span>
              </div>
              <ProgressBar value={wPct} color="#148585" height={2} />
            </>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-ink-800 pt-4 space-y-4 animate-fade-in">
          {p?.['Key Arguments'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Key Arguments</p>
              <p className="text-xs text-ink-400 leading-relaxed">{p['Key Arguments']}</p>
            </div>
          )}
          {p?.['Primary Sources'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Primary Sources</p>
              <p className="text-xs text-ink-400 leading-relaxed">{p['Primary Sources']}</p>
            </div>
          )}
          {p?.['Advisor Feedback'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Advisor Feedback</p>
              <p className="text-xs text-ink-400 leading-relaxed italic">{p['Advisor Feedback']}</p>
            </div>
          )}
          {p?.['Notes'] && (
            <div>
              <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Notes</p>
              <p className="text-xs text-ink-400 leading-relaxed">{p['Notes']}</p>
            </div>
          )}
          {p?.['File Link'] && (
            <a href={p['File Link']} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors">
              <PenLine size={12} /> Open Draft Document
            </a>
          )}
          {p?.['Target Date'] && (
            <p className="text-[10px] text-ink-600 font-mono">Target: {formatDate(p['Target Date'])}</p>
          )}

          {/* Status changer (admin only) */}
          {isAdmin && (
            <div className="flex items-center gap-2 pt-2 border-t border-ink-800">
              <span className="text-[10px] text-ink-600 font-mono">Change status:</span>
              <div className="flex flex-wrap gap-1">
                {['Not Started','Outlining','Drafting','In Review','Revising','Complete'].map(s => {
                  const cfg = getStatus(s)
                  return (
                    <button key={s}
                      onClick={() => onStatusChange(chapter.id, s)}
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DissertationPage() {
  const { isAdmin, isChair, isCommittee } = useAuth()
  const [chapters, setChapters] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [logEntry, setLogEntry] = useState('')
  const [logType, setLogType] = useState('Writing Session')
  const [logChapter, setLogChapter] = useState('General')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const [ch, lg] = await Promise.allSettled([getChapters(), getUpdateLog(10)])
    if (ch.status === 'fulfilled') setChapters(ch.value?.results || [])
    if (lg.status === 'fulfilled') setLog(lg.value?.results || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(pageId, newStatus) {
    await updateChapter(pageId, { Status: newStatus })
    setChapters(prev => prev.map(c =>
      c.id === pageId ? { ...c, props: { ...c.props, Status: newStatus } } : c
    ))
  }

  async function submitLog() {
    if (!logEntry.trim()) return
    setSubmitting(true)
    await addLogEntry({
      'Entry Title': logEntry,
      'Entry Type': logType,
      'Related Chapter': logChapter,
      'date:Date:start': new Date().toISOString().split('T')[0],
      'date:Date:is_datetime': 0,
    })
    setLogEntry('')
    await load()
    setSubmitting(false)
  }

  const totalWords = chapters.reduce((s, c) => s + (c.props?.['Current Word Count'] || 0), 0)
  const goalWords = chapters.reduce((s, c) => s + (c.props?.['Word Count Goal'] || 0), 0)
  const complete = chapters.filter(c => c.props?.Status === 'Complete').length
  const inProgress = chapters.filter(c => ['Drafting','Outlining','In Review','Revising'].includes(c.props?.Status)).length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1">Hampton University · School of Religion</p>
        <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
          Dissertation Hub
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          PhD in Public Theology & Community Engagement
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Chapters Done" value={`${complete}/${chapters.length}`} color={GOLD} icon="✓" />
        <StatCard label="In Progress" value={inProgress} color="#148585" icon="✍" />
        <StatCard label="Words Written" value={totalWords.toLocaleString()} sub={`of ${goalWords.toLocaleString()}`} color="#4E7D4C" icon="◎" />
        <StatCard label="Overall" value={`${Math.round(goalWords ? (totalWords/goalWords)*100 : 0)}%`} sub="word count progress" color="#D4472E" icon="▲" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chapters (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Chapters" subtitle={`${chapters.length} total · click to expand`}
            action={<button onClick={load} className="text-ink-600 hover:text-ink-400 transition-colors"><RefreshCw size={14} /></button>}
          />
          {loading
            ? [1,2,3].map(i => <CardSkeleton key={i} />)
            : chapters.map(ch => (
                <ChapterCard
                  key={ch.id}
                  chapter={ch}
                  onStatusChange={handleStatusChange}
                  isAdmin={isAdmin}
                />
              ))
          }
        </div>

        {/* Right: AI Bar + Log */}
        <div className="space-y-6">
          {/* AI Research Bar */}
          <ResearchBar />

          {/* Log entry form (admin only) */}
          {isAdmin && (
            <div className="card p-5">
              <SectionHeader title="Log Entry" subtitle="Record a writing session or milestone" />
              <div className="space-y-3">
                <textarea
                  value={logEntry}
                  onChange={e => setLogEntry(e.target.value)}
                  placeholder="What did you work on today?"
                  rows={3}
                  className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-xs
                             text-ink-200 placeholder-ink-600 outline-none resize-none
                             focus:border-gold-500 transition-colors"
                />
                <div className="flex gap-2">
                  <select value={logType} onChange={e => setLogType(e.target.value)}
                    className="flex-1 bg-ink-900 border border-ink-700 rounded-lg px-2 py-2 text-xs text-ink-300 outline-none">
                    {['Writing Session','Research','Advisor Meeting','Milestone','Revision','Submission'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select value={logChapter} onChange={e => setLogChapter(e.target.value)}
                    className="flex-1 bg-ink-900 border border-ink-700 rounded-lg px-2 py-2 text-xs text-ink-300 outline-none">
                    {['General','Introduction','Chapter 1','Chapter 2','Chapter 3','Chapter 4','Chapter 5','Conclusion'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={submitLog} disabled={!logEntry.trim() || submitting} className="w-full justify-center">
                  {submitting ? 'Saving…' : 'Add Entry'}
                </Button>
              </div>
            </div>
          )}

          {/* Recent log */}
          <div className="card p-5">
            <SectionHeader title="Activity Log" subtitle="Recent updates" />
            {log.length === 0
              ? <EmptyState icon="◌" message="No log entries yet" />
              : (
                <div className="space-y-3">
                  {log.slice(0,8).map(entry => (
                    <div key={entry.id} className="border-l-2 border-ink-800 pl-3 hover:border-gold-500 transition-colors">
                      <p className="text-xs text-ink-300 leading-snug">{entry.props?.['Entry Title']}</p>
                      <p className="text-[10px] text-ink-600 font-mono mt-0.5">
                        {timeAgo(entry.props?.['date:Date:start'])} · {entry.props?.['Entry Type']} · {entry.props?.['Related Chapter']}
                      </p>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
