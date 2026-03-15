// Notion API client
// All requests proxy through /api/notion to keep the key server-side in production.
// In dev, Vite proxies /api → localhost:3001 (see vite.config.js).

const BASE = '/api/notion'

async function notionRequest(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Notion API error ${res.status}`)
  }
  return res.json()
}

// ─── Database IDs from .env ───────────────────────────────────────────────────
export const DB_IDS = {
  chapters:   import.meta.env.VITE_NOTION_CHAPTER_DB,
  updateLog:  import.meta.env.VITE_NOTION_UPDATELOG_DB,
  programs:   import.meta.env.VITE_NOTION_PROGRAMS_DB,
  milestones: import.meta.env.VITE_NOTION_MILESTONES_DB,
  grants:     import.meta.env.VITE_NOTION_GRANTS_DB,
  comments:   import.meta.env.VITE_NOTION_COMMENTS_DB,
}

// ─── Generic query ────────────────────────────────────────────────────────────
export async function queryDatabase(databaseId, filter, sorts) {
  return notionRequest('/databases/query', {
    method: 'POST',
    body: JSON.stringify({ databaseId, filter, sorts }),
  })
}

// ─── Generic page update ──────────────────────────────────────────────────────
export async function updatePage(pageId, properties) {
  return notionRequest('/pages/update', {
    method: 'PATCH',
    body: JSON.stringify({ pageId, properties }),
  })
}

// ─── Generic page create ──────────────────────────────────────────────────────
export async function createPage(databaseId, properties) {
  return notionRequest('/pages/create', {
    method: 'POST',
    body: JSON.stringify({ databaseId, properties }),
  })
}

// ─── Chapters ─────────────────────────────────────────────────────────────────
export async function getChapters() {
  return queryDatabase(DB_IDS.chapters, undefined, [
    { property: 'Chapter ID', direction: 'ascending' },
  ])
}

export async function updateChapter(pageId, properties) {
  return updatePage(pageId, properties)
}

// ─── Update Log ───────────────────────────────────────────────────────────────
export async function getUpdateLog(limit = 20) {
  return queryDatabase(
    DB_IDS.updateLog,
    undefined,
    [{ property: 'Date', direction: 'descending' }]
  )
}

export async function addLogEntry(properties) {
  return createPage(DB_IDS.updateLog, properties)
}

// ─── Programs ─────────────────────────────────────────────────────────────────
export async function getPrograms(visibleOnly = false) {
  const filter = visibleOnly
    ? { property: 'Visible on Dashboard', checkbox: { equals: true } }
    : undefined
  return queryDatabase(DB_IDS.programs, filter, [
    { property: 'Program ID', direction: 'ascending' },
  ])
}

export async function toggleProgramVisibility(pageId, visible) {
  return updatePage(pageId, { 'Visible on Dashboard': visible })
}

export async function updateProgramStatus(pageId, status) {
  return updatePage(pageId, { Status: status })
}

// ─── Org Milestones ───────────────────────────────────────────────────────────
export async function getMilestones(visibleOnly = false) {
  const filter = visibleOnly
    ? { property: 'Visible on Dashboard', checkbox: { equals: true } }
    : undefined
  return queryDatabase(DB_IDS.milestones, filter, [
    { property: 'Milestone ID', direction: 'ascending' },
  ])
}

export async function toggleMilestoneVisibility(pageId, visible) {
  return updatePage(pageId, { 'Visible on Dashboard': visible })
}

// ─── Grants ───────────────────────────────────────────────────────────────────
export async function getGrants() {
  return queryDatabase(DB_IDS.grants, undefined, [
    { property: 'Deadline', direction: 'ascending' },
  ])
}

export async function createGrant(properties) {
  return createPage(DB_IDS.grants, properties)
}

export async function updateGrantStage(pageId, stage) {
  return updatePage(pageId, { Stage: stage })
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function getComments(section) {
  const filter = section
    ? { property: 'Section', select: { equals: section } }
    : undefined
  return queryDatabase(DB_IDS.comments, filter, [
    { property: 'Date Submitted', direction: 'descending' },
  ])
}

export async function submitComment(properties) {
  return createPage(DB_IDS.comments, properties)
}

export async function resolveComment(pageId) {
  return updatePage(pageId, { Status: 'Resolved' })
}
