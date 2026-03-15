import { useEffect, useState } from 'react'
import { getComments, submitComment, resolveComment } from '../api/notion'
import { StatusBadge, SectionHeader, Button, EmptyState, CardSkeleton } from '../components/shared/UI'
import { timeAgo } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { Send, CheckCheck, RefreshCw } from 'lucide-react'

const SECTIONS = ['General','Dissertation Hub','Chapter 1','Chapter 2','Chapter 3','Chapter 4','Chapter 5','VOW Center Ops','Programs','TBI','501c3 Journey','Grant Pipeline']
const ROLE_COLORS = { 'Dissertation Chair':'#A8CBA6','Committee Member':'#7ACECE','Ministry Leader':'#E8C547','TBI Team':'#F2A898','Grant Collaborator':'#C4C4D4','Admin':'#E8C547' }

function CommentCard({ comment, isAdmin, onResolve }) {
  const p = comment.props
  const status = p?.Status || 'Open'
  const isResolved = status === 'Resolved'
  return (
    <div className={`card p-5 transition-opacity animate-fade-up ${isResolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0" style={{ background: 'var(--bg-surface)', border: '1px solid #32324A' }}>
            {(p?.['Author Name'] || p?.['Author Email'] || '?')[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-ink-300 font-medium">{p?.['Author Name'] || p?.['Author Email'] || 'Anonymous'}</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: ROLE_COLORS[p?.Role] || '#6B6B8F' }}>{p?.Role || 'Viewer'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-ink-700">{timeAgo(p?.['Date Submitted'])}</span>
          <StatusBadge status={status} size="sm" />
          {isAdmin && !isResolved && (
            <button onClick={() => onResolve(comment.id)} className="p-1.5 rounded text-ink-600 hover:text-teal-300 transition-colors" title="Mark resolved">
              <CheckCheck size={13} />
            </button>
          )}
        </div>
      </div>
      {p?.Section && (
        <div className="mb-2">
          <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider" style={{ background: 'var(--bg-raised)', color: '#6B6B8F', border: '1px solid #32324A' }}>{p.Section}</span>
        </div>
      )}
      <p className="text-sm text-ink-300 leading-relaxed">{p?.Comment || ''}</p>
      {p?.Response && (
        <div className="mt-3 pl-3 border-l-2 border-gold-500/40">
          <p className="text-[10px] font-mono text-gold-600 uppercase tracking-widest mb-1">Admin response</p>
          <p className="text-xs text-ink-400 leading-relaxed">{p.Response}</p>
        </div>
      )}
    </div>
  )
}

export default function CommentsPage() {
  const { user, isAdmin, canComment } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sectionFilter, setSectionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('open')
  const [text, setText] = useState('')
  const [section, setSection] = useState('General')
  const [priority, setPriority] = useState('Normal')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function load() {
    setLoading(true)
    const result = await getComments()
    setComments(result?.results || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit() {
    if (!text.trim() || !canComment) return
    setSubmitting(true)
    await submitComment({
      Comment: text,
      'Author Email': user?.email || '',
      Role: user?.role === 'admin' ? 'Admin' : user?.role === 'chair' ? 'Dissertation Chair' : user?.role === 'committee' ? 'Committee Member' : user?.role === 'ministry' ? 'Ministry Leader' : 'Grant Collaborator',
      Section: section,
      Status: 'Open',
      Priority: priority,
      'Visible to Commenter': '__YES__',
    })
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    await load()
    setSubmitting(false)
  }

  async function handleResolve(id) {
    await resolveComment(id)
    setComments(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, Status: 'Resolved' } } : c))
  }

  const filtered = comments.filter(c => {
    const sOk = sectionFilter === 'all' || c.props?.Section === sectionFilter
    const stOk = statusFilter === 'all' || (statusFilter === 'open' && c.props?.Status !== 'Resolved') || (statusFilter === 'resolved' && c.props?.Status === 'Resolved')
    return sOk && stOk
  })

  const openCount = comments.filter(c => c.props?.Status !== 'Resolved').length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl text-ink-100" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>Comments</h1>
        <p className="text-sm text-ink-400 mt-1">{openCount} open · {comments.length - openCount} resolved</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              {['open','resolved','all'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="text-[10px] px-3 py-1.5 rounded-full font-mono capitalize transition-all"
                  style={{ background: statusFilter===f ? 'rgba(184,137,26,0.15)' : 'var(--bg-surface)', color: statusFilter===f ? '#E8C547' : '#6B6B8F', border: `1px solid ${statusFilter===f ? 'rgba(184,137,26,0.3)' : 'var(--border-mid)'}` }}>
                  {f}
                </button>
              ))}
            </div>
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-2 py-1.5 text-xs text-ink-300 outline-none ml-auto">
              <option value="all">All sections</option>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={load} className="text-ink-600 hover:text-ink-400 transition-colors"><RefreshCw size={14} /></button>
          </div>
          {loading ? [1,2,3].map(i => <CardSkeleton key={i} />) :
           filtered.length === 0 ? <EmptyState icon="◌" message="No comments yet in this view" /> :
           filtered.map(c => <CommentCard key={c.id} comment={c} isAdmin={isAdmin} onResolve={handleResolve} />)}
        </div>
        <div>
          {canComment ? (
            <div className="card p-5 sticky top-6">
              <SectionHeader title="Leave a Comment" subtitle={`As: ${user?.role === 'chair' ? 'Dissertation Chair' : user?.role}`} />
              <div className="space-y-3">
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your comment, question, or feedback…" rows={5}
                  className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-xs text-ink-200 placeholder-ink-600 outline-none resize-none focus:border-gold-500 transition-colors" />
                <div>
                  <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Section</label>
                  <select value={section} onChange={e => setSection(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 rounded-lg px-2 py-2 text-xs text-ink-300 outline-none">
                    {SECTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-ink-600 uppercase tracking-widest mb-1.5">Priority</label>
                  <div className="flex gap-1.5">
                    {['Normal','High','Low'].map(p => (
                      <button key={p} onClick={() => setPriority(p)}
                        className="flex-1 text-[10px] py-1.5 rounded-lg font-mono transition-all"
                        style={{ background: priority===p ? 'rgba(184,137,26,0.15)' : 'var(--bg-surface)', color: priority===p ? '#E8C547' : '#6B6B8F', border: `1px solid ${priority===p ? 'rgba(184,137,26,0.3)' : 'var(--border-mid)'}` }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {submitted ? (
                  <div className="flex items-center gap-2 text-xs text-teal-300 py-2"><CheckCheck size={14} /> Comment submitted</div>
                ) : (
                  <Button onClick={handleSubmit} disabled={!text.trim() || submitting} className="w-full justify-center">
                    <Send size={13} /> {submitting ? 'Submitting…' : 'Submit Comment'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <p className="text-xs text-ink-500 text-center leading-relaxed">You have read-only access. Comments can be submitted by invited collaborators.</p>
            </div>
          )}
          <div className="card p-4 mt-4" style={{ border: '1px solid rgba(184,137,26,0.1)' }}>
            <p className="text-[10px] font-mono text-gold-600 uppercase tracking-widest mb-2">Access Roles</p>
            <div className="space-y-1.5">
              {Object.entries(ROLE_COLORS).map(([role, color]) => (
                <div key={role} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-ink-500">{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
