// Anthropic API client
// In production this MUST route through a Vercel serverless function (api/chat.js)
// so the API key stays on the server. The VITE_ prefix makes it browser-accessible
// in dev only — never commit a real key to .env (only .env.local).

const SIAD_SYSTEM_PROMPT = `You are a doctoral research assistant for Antone, a PhD candidate in Public Theology and Community Engagement at Hampton University School of Religion.

## Dissertation Focus
"Black congregations in Philadelphia as anchor institutions for holistic youth development — integrating mentorship, mental health access, and academic advisement."

## SIAD Theological Framework
The SIAD framework is Antone's original constructive theological framework:
- **Stewardship** — Responsible governance of community resources, organizational accountability, 501(c)(3) development
- **Incarnation** — Embodied presence in community, meeting people at their point of need (iThirst model)
- **Activism** — Prophetic engagement with systemic injustice, public theology in action
- **Discipleship** — Formation, theological education (Truth Bible Institute), mentorship (Chess Not Checkers)

## VOW Center (Verity Outreach Worship Center)
A Philadelphia faith-based nonprofit led by Antone. Active programs: Chess Not Checkers (youth mentorship), Builder's Conference, iThirst Street Evangelism, Truth Bible Institute (theological education), Financial Literacy & Stewardship.

## Academic Context
- Institution: Hampton University School of Religion
- Prior frameworks: The Shepherd as Activist (RELO 713), Synergistic Transformation Praxis (Black Church/HBCU course)
- Key dialogue partners: Harris, Jones, Hooker, Allen, Pierce
- Methodology: Qualitative, contextual, participatory action research

## Your Role
- Help synthesize literature and identify theological connections
- Assist with argument development, chapter structuring, and APA citations
- Engage rigorously with ecclesiology, Black church theology, and anchor institution theory
- Ground responses in the SIAD framework when relevant
- Be scholarly but conversational — this is a research partner relationship

Keep responses focused, well-cited where possible, and directly useful for dissertation work.`

export async function askResearchBar(messages, onChunk) {
  // Route through serverless function in production
  const isProduction = import.meta.env.PROD
  const endpoint = isProduction ? '/api/chat' : '/api/chat'

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: SIAD_SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }

  // Handle streaming if supported
  if (res.headers.get('content-type')?.includes('text/event-stream')) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'content_block_delta' && data.delta?.text) {
            fullText += data.delta.text
            onChunk?.(data.delta.text, fullText)
          }
        } catch {}
      }
    }
    return fullText
  }

  // Non-streaming fallback
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  onChunk?.(text, text)
  return text
}
