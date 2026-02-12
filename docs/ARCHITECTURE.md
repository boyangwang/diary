# Architecture

> Last updated: 2026-02-12

## Core Principle: Code-First

**LLM handles natural language input parsing ONLY.** Everything downstream is deterministic TypeScript code — storage, streak calculation, point aggregation, Markdown rendering, serving. This makes the system stable, reproducible, and testable.

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│  INPUT LAYER (LLM — only non-deterministic step)    │
│                                                     │
│  User says: "gym 1hr, brushed teeth, skipped lunch" │
│       ↓                                             │
│  LLM parses → structured JSON entries               │
│  [                                                  │
│    { type: "gym", points: 1.5, notes: "" },         │
│    { type: "brushteeth", points: 1, notes: "" },    │
│    { type: "eatless", points: 1, notes: "skiplunch"}│
│  ]                                                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  STORAGE LAYER (TypeScript — deterministic)         │
│                                                     │
│  core/store.ts                                      │
│  - Append entries to data/YYYY-MM-DD.json           │
│  - Atomic file writes (write-to-tmp + rename)       │
│  - File locking for concurrent access               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  COMPUTE LAYER (TypeScript — deterministic)         │
│                                                     │
│  core/points.ts                                     │
│  - Daily totals                                     │
│  - Domain aggregation (Physical, Mental, etc.)      │
│                                                     │
│  core/streaks.ts                                    │
│  - Current streak per entry type                    │
│  - Longest streak (historical)                      │
│  - Streak broken alerts                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  RENDER LAYER (TypeScript — deterministic)          │
│                                                     │
│  render/json-to-md.ts                               │
│  - Reads all JSON data files                        │
│  - Produces dashboard.md with consistent format     │
│  - Sections: Today, Week, Streaks, Domains, History │
│                                                     │
│  render/md-to-json.ts                               │
│  - Reverse: parse Markdown back to JSON             │
│  - For import/migration scenarios                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  SERVE LAYER (TypeScript — deterministic)           │
│                                                     │
│  server/serve.ts                                    │
│  - Minimal HTTP server (Node built-in http module)  │
│  - Serves rendered dashboard.md as HTML             │
│  - Exposed via Tailscale Funnel                     │
│  - URL: tracker.deardiary.network                   │
└─────────────────────────────────────────────────────┘
```

## LLM Boundary

The LLM is invoked ONLY at the input parsing step. Its output is a structured JSON array of `EntryInstance` objects. The LLM:

- **DOES**: Parse natural language → structured entries
- **DOES NOT**: Calculate streaks, aggregate points, render Markdown, serve files, decide formatting

If the LLM is unavailable, the system continues to function — only new input parsing is blocked. All existing data, rendering, and serving work without it.

## File-Based Storage

Each day's data lives in `data/YYYY-MM-DD.json`. This approach:

- **Simple**: No database setup, no migration
- **Portable**: Copy files to move data
- **Git-friendly**: Each day is a discrete file (though data is gitignored by default for privacy)
- **Concurrent-safe**: File locking prevents corruption

## Three-Level Taxonomy

```
HaradaDomain (8 goals) → SubGoal (grouping) → EntryType (activities)
```

- **Domains** (`src/schema/types.ts`): 8 fixed Harada life domains
- **Sub-Goals** (`data/sub-goals.json`): Intermediate categories within each domain
- **Entry Types** (`data/entry-types.json`): Specific trackable activities, each linked to a domain + sub-goal

Adding a new activity = adding a row to `entry-types.json`. If it needs a new sub-goal, add to `sub-goals.json` too. No code changes needed.

## Markdown ↔ JSON Bidirectional Conversion

### JSON → Markdown (`render/json-to-md.ts`)

Reads JSON data files and produces a human-readable Markdown dashboard. The output format is **fixed and consistent** — same sections, same structure, every day.

### Markdown → JSON (`render/md-to-json.ts`)

Parses a Markdown file back into structured JSON. Used for:
- Importing data from manually edited Markdown
- Migration from other formats
- Roundtrip verification (JSON → MD → JSON should be identity)

## Serving

A minimal HTTP server renders the Markdown dashboard as HTML (using a simple Markdown-to-HTML library or template). Exposed via Tailscale Funnel at `tracker.deardiary.network`.

No authentication needed — the Tailscale Funnel + domain provides access control.
