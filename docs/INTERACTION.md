# Interaction Spec

> Last updated: 2026-02-11

## Commands

### `/diary` — Input Mode

User enters activities via natural language after the command.

```
User: /diary gym 1hr, brushed teeth, skipped lunch
Doudou: ✅ Logged 3 entries for 2026-02-11 (4.5 pts)
  • Gym — 1.5 pts
  • Brush Teeth — 1 pt
  • Eat Less — 1 pt (skiplunch)
```

```
User: /diary yesterday meditation 30min, no supper
Doudou: ✅ Logged 2 entries for 2026-02-10 (2 pts)
  • Meditation — 1 pt
  • No Supper — 1 pt
```

**Doudou's job (LLM):**
1. Parse natural language → entry type IDs + points + notes + date
2. Call TypeScript CRUD functions to persist
3. Confirm what was logged

**Edge cases to handle:**
- "yesterday" / "2 days ago" → date resolution
- Unknown activity → ask user or suggest closest match
- Ambiguous points → use default, confirm

### `/diary status` — Full Dashboard

Renders ALL historical data as Markdown. Not just today, not just this week — everything.

```
User: /diary status
Doudou: [renders full dashboard.md from all JSON data]
```

**Doudou's job (code only, no LLM):**
1. Read all `data/YYYY-MM-DD.json` files
2. Compute streaks, points, domain summaries
3. Render Markdown via `json-to-md.ts`
4. Return as message

---

## What Is NOT a Command

Regular conversation is NOT diary input. If Boyang says "I went to the gym today" in normal chat without `/diary`, it is NOT auto-logged. The `/diary` prefix is the explicit intent signal.

---

## Data Flow

```
/diary <natural language>
    ↓
LLM: parse → structured entries (ONLY LLM step)
    ↓
TypeScript: addEntries() → write data/YYYY-MM-DD.json
    ↓
Confirmation message back to Telegram

/diary status
    ↓
TypeScript: read ALL data/*.json → computeStreaks + computePoints → renderDashboard
    ↓
Markdown message back to Telegram
```
