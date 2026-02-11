# Interaction Spec

> Last updated: 2026-02-11

---

## Architecture Decision: Dedicated Telegram Bot

A **separate Telegram bot account** is dedicated exclusively to diary operations. Every message sent to this bot IS diary input — no slash commands needed, no intent detection, no ambiguity.

**Why separate bot:**
- No slash command friction — every message = diary input
- No intent detection needed — context is always diary
- Clean separation from general Doudou conversation
- Explicit context switch: opening this chat = "I'm logging my day"
- Simpler to reason about — all messages map to diary operations

**Architecture:**
- Separate OpenClaw session dedicated to diary
- Same Mac Mini, same data store (`/Users/claw/diary/data/`)
- LLM parses natural language → primitive operations
- TypeScript code handles all CRUD + rendering

---

## Core Flow: Confirm Before Persist

**CRITICAL SAFETY RULE:** No data is written until explicitly confirmed by the user.

```
Step 1: User sends natural language
        "gym 1hr, brushed teeth, skipped lunch"

Step 2: LLM maps to PRIMITIVE OPERATIONS, shows preview:

        📋 Mapped operations:
        ┌──────────────────────────────────────────┐
        │ ADD  2026-02-11  gym        1.5 pts      │
        │ ADD  2026-02-11  brushteeth 1.0 pts      │
        │ ADD  2026-02-11  eatless    1.0 pts  "skiplunch" │
        └──────────────────────────────────────────┘

        ✅ Confirm  /  ✏️ Edit  /  ❌ Cancel

Step 3: User confirms, corrects, or cancels
        - "ok" / "confirm" / ✅ → persist
        - "change gym to 2hrs" → re-map, show again
        - "cancel" / ❌ → discard

Step 4: ONLY on explicit confirm → TypeScript persists to JSON

Step 5: Confirmation message:
        ✅ Saved 3 entries for 2026-02-11 (3.5 pts total)
```

**Why this matters:** Prevents catastrophic misinterpretation. "Oh shit, I didn't do anything today" must NEVER be interpreted as "delete everything." User always sees what will happen before it happens.

---

## Primitive Operations

Only three operations exist. No bulk operations. No implicit destructive actions.

### ADD
```
ADD <date> <entryTypeId> <points> [notes]
```
Append a new entry to a day.

### DELETE
```
DELETE <date> <entryId>
```
Remove a specific entry by ID. Requires showing the entry first so user can identify it.

### UPDATE
```
UPDATE <date> <entryId> <field> <newValue>
```
Modify a specific field (points, notes, entryTypeId) of an existing entry.

**Constraints:**
- No "delete all" operation
- No bulk modifications across multiple days
- Each operation is atomic (one entry at a time)
- All operations shown to user before execution

---

## Points Model: Two Tiers

### Simple Activities (no parameter)
Fixed points, no questions needed.

```
brushteeth    → always 1 pt
shower        → always 1 pt
sinusrinse    → always 1 pt
nosupper      → always 1 pt
```

### Parameterized Activities
Have a parameter (usually duration), default parameter value, and points-per-unit rate.

```
gym           → default 1 hr × 1.5 pts/hr = 1.5 pts
                "gym 2hrs" → 2 × 1.5 = 3.0 pts
                "gym" (no param) → use default = 1.5 pts

work          → default 1 hr × 1.0 pts/hr = 1.0 pts
                "work 3hrs" → 3 × 1.0 = 3.0 pts

meditation    → default 30 min × 2.0 pts/hr = 1.0 pts
                "meditation 1hr" → 1 × 2.0 = 2.0 pts
```

**Schema additions needed:**
```typescript
interface EntryType {
  // ... existing fields ...
  
  // Points model
  parameterized: boolean;          // true = has duration/quantity param
  defaultParamValue?: number;      // e.g., 1 (hour)
  defaultParamUnit?: string;       // e.g., "hr", "min", "count"
  pointsPerUnit?: number;          // e.g., 1.5 pts per hour
  // For non-parameterized: just use defaultPoints directly
}
```

---

## Entry Type Matching

User says natural language, LLM maps to entry type IDs.

**Examples:**
- "went to the gym" → `gym`
- "worked out" → `gym`
- "brushed my teeth" → `brushteeth`
- "didn't eat dinner" → `nosupper`
- "skipped lunch" → `eatless`

**When ambiguous:** Ask the user. "Did you mean gym or badminton?"

**Alias system (future):** Each entry type can have aliases for better matching:
```typescript
interface EntryType {
  // ... existing fields ...
  aliases?: string[];  // e.g., ["workout", "exercise", "lifted"]
}
```

---

## Date Handling

- Default: **today** (Singapore timezone, UTC+8)
- "yesterday" → yesterday's date
- "2 days ago" → date math
- Explicit date: "on Monday" / "on Feb 10" → resolve to YYYY-MM-DD
- If ambiguous: ask

---

## Pending Operation Queue

**One pending operation set at a time.**

- If user sends new input while operations are pending → append to pending set
- Re-show the full pending set for confirmation
- Only persist when user explicitly confirms the complete set

**Example:**
```
User: gym 1hr
Bot:  📋 Pending: ADD gym 1.5 pts. Confirm?

User: also brushed teeth
Bot:  📋 Pending:
      ADD gym 1.5 pts
      ADD brushteeth 1.0 pts
      Confirm?

User: ok
Bot:  ✅ Saved 2 entries for 2026-02-11 (2.5 pts)
```

---

## Status Command

`/diary status` (or just "status" in the dedicated bot) renders ALL historical data as Markdown.

- Reads all `data/YYYY-MM-DD.json` files
- Computes streaks, points, domain summaries
- Renders via `json-to-md.ts`
- Returns as Telegram message

This is pure TypeScript code — no LLM involved.

---

## Sync & Concurrency

- Single-user system, sequential operations
- Each confirmed operation = atomic file write (tmp + rename)
- No concurrent writes possible (one pending set at a time)
- No sync issues
