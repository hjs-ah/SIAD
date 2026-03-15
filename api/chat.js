// api/chat.js — Vercel serverless function
// Proxies Anthropic API calls. API key stays server-side only.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' })
  }

  const { model, max_tokens, system, messages, stream } = req.body

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-opus-4-5',
      max_tokens: max_tokens || 2048,
      system,
      messages,
      stream: stream || false,
    }),
  })

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    anthropicRes.body.pipeTo(
      new WritableStream({
        write(chunk) { res.write(chunk) },
        close() { res.end() },
      })
    )
    return
  }

  const data = await anthropicRes.json()
  return res.status(anthropicRes.status).json(data)
}
