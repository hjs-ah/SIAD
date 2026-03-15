# Dissertation Dashboard — SIAD Framework

A full-stack admin dashboard for doctoral research, VOW Center operations, and grant development. Built on React + Vite + Vercel + Notion API + Anthropic API.

**Hampton University School of Religion · PhD in Public Theology & Community Engagement**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + custom design tokens |
| Data | Notion API (6 databases) |
| AI Research Bar | Anthropic API (Claude Opus) |
| Auth | Email-based allowlist (Clerk-ready) |
| Deployment | Vercel (serverless API routes) |
| Version control | GitHub + GitHub Desktop |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/dissertation-dashboard.git
cd dissertation-dashboard
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

- **`VITE_NOTION_API_KEY`** — from [notion.so/my-integrations](https://notion.so/my-integrations)
  - Create an integration, give it access to the Dissertation Dashboard page
  - All 6 database IDs are pre-filled from Phase 1 setup

- **`VITE_ANTHROPIC_API_KEY`** — from [console.anthropic.com](https://console.anthropic.com)

- **`VITE_ADMIN_EMAILS`** — your email address

- **`VITE_COLLABORATOR_EMAILS`** — format: `email:role,email:role`
  - Roles: `chair`, `committee`, `ministry`, `grant_writer`
  - Example: `chair@hampton.edu:chair,colleague@vow.org:ministry`

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with your admin email.

---

## Notion Integration

The app reads from and writes to 6 Notion databases:

| Database | ID (pre-configured) | Used by |
|---|---|---|
| Chapter Tracker | `78202be3-...` | Dissertation Hub |
| Update Log | `402192b1-...` | Dissertation Hub |
| Programs DB | `b2f6651a-...` | VOW Center |
| Org Milestones | `f7be4254-...` | VOW Center |
| Grant Pipeline | `b665c657-...` | Grants |
| Comments DB | `068cda99-...` | Comments |

> **Important:** Your Notion integration must be shared with the Dissertation Dashboard page in Notion. Go to the page → Share → Invite your integration.

---

## Deploy to Vercel

### Option A: GitHub Desktop → Vercel (recommended)

1. Push this repo to GitHub via GitHub Desktop
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   - `NOTION_API_KEY` (without VITE_ prefix — server-side only)
   - `ANTHROPIC_API_KEY` (without VITE_ prefix — server-side only)
   - `VITE_ADMIN_EMAILS`
   - `VITE_COLLABORATOR_EMAILS`
   - All `VITE_NOTION_*_DB` variables
4. Deploy — Vercel auto-deploys on every push to `main`

### Note on API keys
In production, `NOTION_API_KEY` and `ANTHROPIC_API_KEY` (without the `VITE_` prefix) are used by the serverless functions in `/api/` and never exposed to the browser. The `VITE_` prefixed versions in `.env.local` are for local development only.

---

## Architecture

```
dissertation-dashboard/
├── api/                    # Vercel serverless functions
│   ├── notion.js           # Notion API proxy
│   └── chat.js             # Anthropic API proxy
├── src/
│   ├── api/                # Frontend API clients
│   │   ├── notion.js       # All 6 databases
│   │   └── anthropic.js    # AI Research Bar
│   ├── context/
│   │   └── AuthContext.jsx # Email gate + role detection
│   ├── components/
│   │   └── shared/
│   │       ├── UI.jsx      # Design system components
│   │       └── Sidebar.jsx # Role-gated navigation
│   ├── views/
│   │   ├── LoginPage.jsx        # Email gate
│   │   ├── OverviewPage.jsx     # Admin analytics overview
│   │   ├── DissertationPage.jsx # Chapter tracker + AI bar
│   │   ├── VowCenterPage.jsx    # Programs + milestones
│   │   ├── GrantsPage.jsx       # Grant pipeline
│   │   └── CommentsPage.jsx     # Collaboration
│   ├── utils/helpers.js    # Formatters, SIAD config
│   ├── App.jsx             # Router + auth guard
│   └── main.jsx            # Entry point
├── .env.example            # Environment template
├── vercel.json             # Deployment config
└── tailwind.config.js      # Design tokens
```

---

## SIAD Framework

The dashboard is organized around the four theological pillars:

| Pillar | Color | Focus |
|---|---|---|
| **S**tewardship | Gold `#B8891A` | 501c3, grants, organizational governance |
| **I**ncarnation | Teal `#148585` | Community presence, iThirst |
| **A**ctivism | Coral `#D4472E` | Public theology, prophetic engagement |
| **D**iscipleship | Sage `#4E7D4C` | TBI, Chess Not Checkers, formation |

---

## Phase Roadmap

- [x] **Phase 1** — Notion structure (6 databases, all records seeded)
- [x] **Phase 2** — Vercel app (this codebase — React + all views + AI bar)
- [ ] **Phase 3** — Clerk auth upgrade, hero image uploads (Vercel Blob), Zotero API sync
