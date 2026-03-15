// api/notion.js — Vercel serverless function
// Proxies Notion API calls so the key never reaches the browser bundle.

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const path = pathname.replace('/api/notion', '')

  const NOTION_KEY = process.env.NOTION_API_KEY
  if (!NOTION_KEY) {
    return res.status(500).json({ message: 'Notion API key not configured' })
  }

  const notionBase = 'https://api.notion.com/v1'
  let notionUrl = ''
  let notionBody = {}

  if (path === '/databases/query') {
    const { databaseId, filter, sorts } = req.body
    notionUrl = `${notionBase}/databases/${databaseId}/query`
    notionBody = {}
    if (filter) notionBody.filter = filter
    if (sorts) notionBody.sorts = sorts
  } else if (path === '/pages/update') {
    const { pageId, properties } = req.body
    notionUrl = `${notionBase}/pages/${pageId}`
    notionBody = { properties: buildNotionProperties(properties) }
    const notionRes = await fetch(notionUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notionBody),
    })
    const data = await notionRes.json()
    return res.status(notionRes.status).json(data)
  } else if (path === '/pages/create') {
    const { databaseId, properties } = req.body
    notionUrl = `${notionBase}/pages`
    notionBody = {
      parent: { database_id: databaseId },
      properties: buildNotionProperties(properties),
    }
  } else {
    return res.status(404).json({ message: 'Unknown Notion proxy endpoint' })
  }

  const method = path === '/databases/query' ? 'POST' : 'POST'
  const notionRes = await fetch(notionUrl, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notionBody),
  })

  const data = await notionRes.json()

  // Transform results into flat objects for the frontend
  if (data.results) {
    data.results = data.results.map(transformPage)
  }

  return res.status(notionRes.status).json(data)
}

// Transform Notion page properties to simple key/value pairs
function transformPage(page) {
  const props = {}
  for (const [key, val] of Object.entries(page.properties || {})) {
    props[key] = extractValue(val)
  }
  return { id: page.id, url: page.url, createdTime: page.created_time, props }
}

function extractValue(prop) {
  switch (prop.type) {
    case 'title':         return prop.title?.map(t => t.plain_text).join('') || ''
    case 'rich_text':     return prop.rich_text?.map(t => t.plain_text).join('') || ''
    case 'select':        return prop.select?.name || null
    case 'multi_select':  return prop.multi_select?.map(s => s.name) || []
    case 'number':        return prop.number
    case 'checkbox':      return prop.checkbox
    case 'url':           return prop.url
    case 'email':         return prop.email
    case 'date':          return prop.date?.start || null
    case 'created_time':  return prop.created_time
    case 'last_edited_time': return prop.last_edited_time
    case 'unique_id':     return `${prop.unique_id?.prefix || ''}${prop.unique_id?.number || ''}`
    case 'status':        return prop.status?.name || null
    default:              return null
  }
}

// Convert simple key/value to Notion property format
function buildNotionProperties(properties) {
  const out = {}
  for (const [key, val] of Object.entries(properties)) {
    if (typeof val === 'boolean') {
      out[key] = { checkbox: val }
    } else if (typeof val === 'number') {
      out[key] = { number: val }
    } else if (val === null) {
      out[key] = { rich_text: [] }
    } else {
      // Default to select for known select fields, rich_text otherwise
      out[key] = { select: { name: val } }
    }
  }
  return out
}
