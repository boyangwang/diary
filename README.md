# Diary — Life Tracking System

> "Time is your most valuable asset (till immortality)"

A personal life tracking system built on three pillars:

1. **Diary** — Continuous data recording. Activities → points → streaks → trends.
2. **Harada Method** — Top-down goal structure. Every activity maps to a life domain.
3. **AI Accountability** — An active partner that parses natural language input, reminds, and prevents lapse.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design.

**Key principle:** LLM handles natural language input parsing ONLY. Everything else is deterministic TypeScript code.

```
Voice/Text input (natural language)
        ↓
   LLM: parse → structured JSON entry     ← ONLY non-deterministic step
        ↓
   TypeScript: append to data/YYYY-MM-DD.json
   TypeScript: recalculate streaks, points, totals
   TypeScript: regenerate dashboard.md
        ↓
   Static HTTP server → tracker.deardiary.network
```

## Quick Start

```bash
npm install
npm run build
npm run serve          # Start dashboard server
npm run render         # Regenerate dashboard.md from JSON data
npm run import         # Import legacy diary app data
```

## Project Structure

```
diary/
├── src/
│   ├── schema/        # TypeScript types & interfaces
│   ├── core/          # Business logic (store, streaks, points, entries)
│   ├── render/        # JSON ↔ Markdown bidirectional conversion
│   ├── server/        # Static HTTP server for dashboard
│   └── cli/           # CLI entry points
├── data/              # JSON data files (gitignored, local only)
├── docs/              # Architecture, schema, decisions, roadmap
└── tests/             # Unit tests
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 22
- **Data:** File-based JSON (one file per day)
- **View:** Markdown (generated from JSON)
- **Serving:** Minimal HTTP server via Tailscale Funnel
- **Testing:** Vitest

## Phases

- **Phase 0** — "Just Talk to Me": Voice/text → LLM parse → JSON → Markdown → Serve
- **Phase 1** — Dashboard + Harada integration + charts
- **Phase 2** — Calendar correlation, proactive AI, shareable summaries

---

*Started 2026-02-11. Rebuilt from scratch on the `boyangwang/diary` repo.*
