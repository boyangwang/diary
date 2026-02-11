# Roadmap

> Last updated: 2026-02-11

## Phase 0: "Just Talk to Me" (Current)

**Goal:** Prove the habit. Zero-friction tracking via natural language.

**How it works:**
1. Boyang tells Doudou (via Telegram) what he did today
2. Doudou's LLM parses natural language → structured JSON entries
3. TypeScript code appends entries to `data/YYYY-MM-DD.json`
4. TypeScript code regenerates `dashboard.md`
5. Dashboard served at `tracker.deardiary.network`

**Deliverables:**
- [ ] TypeScript types and schemas (`src/schema/types.ts`)
- [ ] JSON store (read/write daily files) (`src/core/store.ts`)
- [ ] Entry operations (`src/core/entry.ts`)
- [ ] Streak calculation (`src/core/streaks.ts`)
- [ ] Points aggregation (`src/core/points.ts`)
- [ ] JSON → Markdown renderer (`src/render/json-to-md.ts`)
- [ ] Markdown → JSON parser (`src/render/md-to-json.ts`)
- [ ] Minimal HTTP server (`src/server/serve.ts`)
- [ ] Tailscale Funnel setup for `tracker.deardiary.network`
- [ ] Legacy data import script (`src/cli/import-legacy.ts`)
- [ ] Entry types registry with Harada domain mapping
- [ ] Unit tests for core logic
- [ ] Evening reminder cron job

---

## Phase 1: Dashboard + Harada Layer

**Goal:** Visual dashboard with domain-level insights.

**Planned:**
- Interactive HTML dashboard (not just Markdown)
- Stacked area chart (daily points by domain over time)
- Streak visualizations
- Harada goal tree view
- Calendar integration (correlate events with tracking)

---

## Phase 2: Proactive AI + Sharing

**Goal:** Active accountability partner + social sharing.

**Planned:**
- Calendar correlation ("You had gym at 3 PM — did you go?")
- Proactive reminders and check-ins
- Shareable daily summary in multiple formats:
  - Webpage (persistent URL, always up to date)
  - Image (shareable card)
  - Text (copy-paste chunk)
- Share link: when shared once, people can check back anytime
- Good day → easy to share. Bad day → visibility creates accountability.
