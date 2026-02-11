# Data Schema

> Last updated: 2026-02-11

## Overview

All data is stored as JSON files. TypeScript types define the contracts.

---

## Entry Type (`EntryType`)

Defines a trackable activity category. Stored in `data/entry-types.json`.

```typescript
interface EntryType {
  id: string;                              // Unique slug, e.g., "gym", "brushteeth"
  title: string;                           // Display name, e.g., "Gym", "Brush Teeth"
  defaultPoints: number;                   // Default points when logging (e.g., 1)
  pointStep: number;                       // Increment granularity (e.g., 0.5)
  routine: "Daily" | "Weekly" | "Adhoc";   // Expected frequency
  domain: HaradaDomain;                    // Harada method domain mapping
  themeColors: [string, string];           // Gradient hex colors (no #)
  createdAt: number;                       // Unix timestamp ms
  updatedAt: number;                       // Unix timestamp ms
}
```

### Harada Domains

```typescript
type HaradaDomain =
  | "physical"     // 身体 — strength, cardio, flexibility, hygiene
  | "mental"       // 心理 — wellness, social, dog, relaxation
  | "sleep"        // 睡 — wind-down, sleep quality, timing
  | "eat"          // 吃 — fasting, diet discipline, safe foods
  | "medical"      // 医疗 — health screening, treatments, medication
  | "business"     // 业界 — work, trading, networking, PR, content
  | "academic"     // 学界 — learning, papers, institutional connections
  | "methodology"; // 鸡血 — productivity, habit systems, tools, rituals
```

---

## Entry Instance (`EntryInstance`)

A single logged activity. Stored in `data/YYYY-MM-DD.json` (array per day).

```typescript
interface EntryInstance {
  id: string;           // Unique ID: `${entryTypeId}-${ISO timestamp}-${random}`
  date: string;         // "YYYY-MM-DD"
  entryTypeId: string;  // Reference to EntryType.id
  points: number;       // Actual points (may differ from default)
  notes: string;        // Free text notes
  createdAt: number;    // Unix timestamp ms
  updatedAt: number;    // Unix timestamp ms
}
```

### Daily File Format (`data/YYYY-MM-DD.json`)

```json
{
  "date": "2026-02-11",
  "entries": [
    {
      "id": "gym-2026-02-11T10:30:00.000Z-42",
      "date": "2026-02-11",
      "entryTypeId": "gym",
      "points": 1.5,
      "notes": "Salam PT session, shoulder focus",
      "createdAt": 1739263800000,
      "updatedAt": 1739263800000
    },
    {
      "id": "brushteeth-2026-02-11T07:00:00.000Z-17",
      "date": "2026-02-11",
      "entryTypeId": "brushteeth",
      "points": 1,
      "notes": "",
      "createdAt": 1739251200000,
      "updatedAt": 1739251200000
    }
  ]
}
```

---

## Entry Types Registry (`data/entry-types.json`)

```json
{
  "entryTypes": [
    {
      "id": "gym",
      "title": "Gym",
      "defaultPoints": 1,
      "pointStep": 0.5,
      "routine": "Adhoc",
      "domain": "physical",
      "themeColors": ["FC8D3C", "FF5912"],
      "createdAt": 1739260000000,
      "updatedAt": 1739260000000
    }
  ]
}
```

---

## Computed Types (Not Stored)

These are computed at render time from the raw data:

```typescript
interface DailySummary {
  date: string;
  entries: EntryInstance[];
  totalPoints: number;
  entryCount: number;
  pointsByDomain: Record<HaradaDomain, number>;
  pointsByType: Record<string, number>;
}

interface StreakInfo {
  entryTypeId: string;
  currentStreak: number;          // Days in a row (including today if logged)
  longestStreak: number;          // All-time longest
  longestStreakStart: string;     // "YYYY-MM-DD"
  longestStreakEnd: string;       // "YYYY-MM-DD"
  lastLoggedDate: string;        // "YYYY-MM-DD"
  isActiveToday: boolean;        // Logged today?
}

interface WeekSummary {
  weekStart: string;             // Monday "YYYY-MM-DD"
  weekEnd: string;               // Sunday "YYYY-MM-DD"
  days: DailySummary[];
  totalPoints: number;
  avgPointsPerDay: number;
  activeDays: number;
  pointsByDomain: Record<HaradaDomain, number>;
}
```

---

## Dashboard Markdown Structure

The rendered `dashboard.md` has a fixed structure:

```markdown
# 📊 Life Dashboard
> Last updated: YYYY-MM-DD HH:mm (SGT)

## Today — YYYY-MM-DD (Day)
| Activity | Points | Notes |
|----------|--------|-------|
| ...      | ...    | ...   |
**Total: X.X pts** | By domain: Physical X, Mental X, ...

## Streaks 🔥
| Activity | Current | Best | Status |
|----------|---------|------|--------|
| ...      | ...     | ...  | ✅/⚠️  |

## This Week (Mon–Sun)
| Day | Points | Entries | Top Activity |
|-----|--------|---------|-------------|
| Mon | ...    | ...     | ...         |
| ... | ...    | ...     | ...         |
**Week Total: X.X pts** | Avg: X.X/day

## Domain Summary (This Week)
| Domain | Points | % |
|--------|--------|---|
| Physical 身体 | ... | ... |
| Mental 心理   | ... | ... |
| ...           | ... | ... |

## Last 30 Days
(Daily point totals, simple text sparkline or table)
```

---

## Migration from Legacy Format

The legacy diary app export uses a different structure:
- Entry types in `entryTypesArray` (no `domain` field)
- Instances in `entryInstancesMap` keyed by date string
- Some duplicate type IDs (`brushteech`/`brushteeth`, `vitamin`/`vitaminsupplements`)

The `import-legacy.ts` script handles:
1. Mapping legacy types → new types (with domain assignment)
2. Deduplication of type IDs
3. Converting `entryInstancesMap` → per-day JSON files
4. Preserving all original timestamps and notes
