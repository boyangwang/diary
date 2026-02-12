# Architecture Decision Records

> Log of key design decisions with context and rationale.

---

## ADR-001: TypeScript for Everything

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Need a language for the tracking system's deterministic code layer.

**Decision:** TypeScript (strict mode) for all code. No Python, no shell scripts for core logic.

**Rationale:** Boyang's explicit requirement. TypeScript provides type safety, good Node.js ecosystem, and is the language of the original diary app (React + TS frontend).

---

## ADR-002: LLM Boundary — Input Parsing Only

**Date:** 2026-02-11
**Status:** Accepted

**Context:** The system uses an AI agent (Doudou) as an accountability partner. Need to decide how much the LLM controls.

**Decision:** LLM handles ONLY natural language → structured JSON parsing. Everything else (storage, computation, rendering, serving) is deterministic TypeScript code.

**Rationale:** Boyang wants stability. LLM output is non-deterministic by nature. By confining it to input parsing, we get:
- Reproducible renders (same JSON → always same Markdown)
- Testable logic (unit tests for streaks, points, rendering)
- System works even if LLM is unavailable (only new input blocked)
- No "drift" in formatting or behavior over time

---

## ADR-003: File-Based JSON Storage (No Database)

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Need to store daily tracking data.

**Decision:** One JSON file per day (`data/YYYY-MM-DD.json`). Entry types in `data/entry-types.json`.

**Rationale:**
- Simple — no database setup, migration, or connection management
- Portable — copy files to backup or move
- Human-readable — can inspect data directly
- Git-friendly — each day is a discrete file
- Sufficient for personal tracking scale (1 person, ~10-20 entries/day)

**Trade-offs:** No query engine, no indexing. Acceptable at this scale. If needed later, can add SQLite without changing the JSON format (just index from it).

---

## ADR-004: JSON ↔ Markdown Bidirectional Conversion

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Need both machine-readable data (for computation) and human-readable output (for daily review).

**Decision:** JSON is the source of truth. Markdown is generated FROM JSON via TypeScript. A reverse parser (MD → JSON) exists for import/migration.

**Rationale:**
- JSON: structured, parseable, future-proof for dashboards/charts/API
- Markdown: readable, viewable in any text editor or browser
- Bidirectional: supports roundtrip (JSON → MD → JSON = identity) and importing from hand-edited Markdown
- No trade-off: user gets both, the code is the bridge

---

## ADR-005: Tailscale Funnel for Serving

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Boyang wants to access the dashboard via a single persistent URL.

**Decision:** Serve the rendered dashboard via a minimal HTTP server on Mac Mini, exposed via Tailscale Funnel at `tracker.deardiary.network`.

**Rationale:**
- Already have Tailscale infrastructure in place
- Already own `deardiary.network` domain with DigitalOcean DNS
- Tailscale Funnel provides HTTPS automatically
- No auth needed — access control via Tailscale
- Minimal server — just serve one rendered HTML page

---

## ADR-006: Harada Method Domain Mapping

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Boyang wants a top-down goal structure above raw activity tracking.

**Decision:** 8 domains from Boyang's Harada framework:
- Outlive 4: Physical, Mental, Sleep, Eat
- Headache 1: Medical
- Mundane 3: Business, Academic, Methodology

Every entry type maps to exactly one domain. Points aggregate by domain for high-level view.

**Rationale:** Boyang's own categorization. Matches his life mission document. Provides the "why" above the "what" — not just "I brushed teeth" but "I contributed to Medical/Teeth".

---

## ADR-007: Reuse Existing Entry Types from Legacy Data

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Legacy diary app has 29 entry types with 627 historical entries (2018-2025).

**Decision:** Import all legacy entry types, assign Harada domains, merge duplicates (brushteech→brushteeth, vitaminsupplements→vitamin). Preserve all historical data.

**Rationale:**
- Continuity — don't lose years of tracking history
- Entry types already reflect Boyang's real life activities
- Adding domain mapping is additive, not destructive
- New types will be added as needed (29 is a starting point, not a limit)

---

## ADR-008: Dedicated Telegram Bot for Diary

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Need to decide how diary input reaches the system. Options: (a) slash commands in existing Doudou chat, (b) dedicated bot.

**Decision:** Separate Telegram bot account dedicated exclusively to diary operations.

**Rationale:**
- Every message to the bot IS diary input — no slash command friction
- No intent detection needed — context is always diary
- Clean separation from general Doudou conversation
- Explicit context switch: opening this chat = "I'm logging my day"
- No risk of accidental diary logging from casual conversation

**Trade-off:** User opens a different chat. But this is a feature — deliberate context boundary.

---

## ADR-009: Confirm Before Persist (Safety)

**Date:** 2026-02-11
**Status:** Accepted

**Context:** LLM parses natural language into operations. Misinterpretation could cause data loss. Example: "Oh shit, I didn't do anything today" must NEVER become "delete all entries."

**Decision:** All operations are shown to the user as a preview before any data is written. User must explicitly confirm (e.g., "ok", "confirm") before persistence.

**Flow:** Input → LLM maps to primitives → Show preview → User confirms/edits/cancels → Only then persist.

**Rationale:**
- Prevents catastrophic misinterpretation
- User always knows exactly what will be written
- Supports iterative correction ("change gym to 2hrs")
- Zero data loss risk from LLM errors

---

## ADR-010: Three Primitive Operations Only

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Need to define what the LLM can map natural language to.

**Decision:** Exactly three primitives: ADD, DELETE, UPDATE. No bulk operations. No "delete all." Each operates on a single entry.

**Rationale:**
- Minimal surface area for mistakes
- Easy to preview and understand
- Each operation is atomic and reversible
- Combined with confirm-before-persist, provides strong safety guarantees

---

## ADR-011: Two-Tier Points Model

**Date:** 2026-02-11
**Status:** Accepted

**Context:** Some activities have fixed points (brushteeth = 1 pt always), others depend on duration/effort (gym = varies by hours).

**Decision:** Two tiers:
- **Simple (non-parameterized):** Fixed `defaultPoints`, no questions needed
- **Parameterized:** Has `defaultParamValue`, `defaultParamUnit`, `pointsPerUnit`. Points = param × rate. If user doesn't specify param, use default.

**Examples:**
- `brushteeth` (simple): always 1 pt
- `gym` (parameterized): default 1 hr × 1.5 pts/hr = 1.5 pts; "gym 2hrs" = 3.0 pts

**Rationale:** Matches Boyang's historical usage patterns (work: 1-8 pts based on hours, brushteeth: always 1 pt). Preserves simplicity for routine habits while supporting granularity for effort-based activities.

---

## ADR-012: Three-Level Taxonomy (Domain → Sub-Goal → Activity)

**Date:** 2026-02-12
**Status:** Accepted

**Context:** Entry types (activities) map directly to Harada domains, but some activities are distinct yet fall under the same conceptual sub-category. Example: Gym and Pilates are different activities but both relate to physical conditioning. Boyang's insight: "We have 8 goals from Harada, then many sub-goals. These create the taxonomy for all activities."

**Decision:** Three-level hierarchy:
1. **HaradaDomain** (8 goals) — top level, fixed
2. **SubGoal** — intermediate grouping within each domain (e.g., "Strength Training", "Cardio & Sports")
3. **EntryType** (activities) — the detailed trackable items

Each `EntryType` has both `domain` and `subGoalId` fields. Sub-goals are stored in `data/sub-goals.json`.

**Rationale:**
- Pilates ≠ Gym, but both are Physical activities (different sub-goals: flexibility vs strength)
- Enables aggregation at multiple levels: domain, sub-goal, activity
- Mirrors Harada OW64 structure (main goals → sub-goals → action items)
- Sub-goals are flexible — not locked to 8 per domain
- 29 entry types (and growing) need organizational structure beyond flat domain mapping
