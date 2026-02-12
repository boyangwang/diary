# Data Schema

> Last updated: 2026-02-12

## Overview

All data is stored as JSON files. TypeScript types define the contracts.

## Taxonomy: Three-Level Hierarchy

```
HaradaDomain (8 goals)
  └── SubGoal (categorization layer)
       └── EntryType (specific trackable activities)
```

**Example:**
```
Physical 身体
  ├── Strength Training 力量训练
  │   ├── Gym
  │   └── Pilates
  ├── Cardio & Sports 有氧与运动
  │   ├── Badminton
  │   └── Walk
  ├── Flexibility & Recovery 柔韧与恢复
  │   └── Physio
  └── Hygiene 个人卫生
      └── Shower
```

---

## Harada Domains (8)

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

## Sub-Goal (`SubGoal`)

Intermediate categorization between domains and activities. Stored in `data/sub-goals.json`.

```typescript
interface SubGoal {
  id: string;            // Unique slug, e.g., "strength-training"
  title: string;         // English display name
  titleZh: string;       // Chinese display name
  domain: HaradaDomain;  // Parent domain
  description: string;   // Brief description
}
```

---

## Entry Type (`EntryType`)

Defines a trackable activity category. Stored in `data/entry-types.json`.

```typescript
interface EntryType {
  id: string;                              // Unique slug, e.g., "gym", "brushteeth"
  title: string;                           // Display name
  defaultPoints: number;                   // Default points when logging
  pointStep: number;                       // Increment granularity
  routine: "Daily" | "Weekly" | "Adhoc";   // Expected frequency
  domain: HaradaDomain;                    // Harada method domain
  subGoalId: string;                       // Sub-goal within domain
  themeColors: [string, string];           // Gradient hex colors (no #)
  createdAt: number;                       // Unix timestamp ms
  updatedAt: number;                       // Unix timestamp ms
}
```

### Extended Fields (runtime, not in base interface)

Entry types in `data/entry-types.json` may have additional fields used by the parser:

```typescript
// Parameterized entry types (duration-based points)
parameterized?: boolean;
defaultParamValue?: number;    // e.g., 1 (hour)
defaultParamUnit?: string;     // e.g., "hr"
pointsPerUnit?: number;        // e.g., 1.5 pts per hour
aliases?: string[];            // Alternative names (EN + 中文)
```

---

## Entry Instance (`EntryInstance`)

A single logged activity. Stored in `data/YYYY-MM-DD.json`.

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
  "date": "2026-02-12",
  "entries": [
    {
      "id": "gym-2026-02-12T10:30:00.000Z-42",
      "date": "2026-02-12",
      "entryTypeId": "gym",
      "points": 1.5,
      "notes": "shoulder focus",
      "createdAt": 1739350200000,
      "updatedAt": 1739350200000
    }
  ]
}
```

---

## Computed Types (Not Stored)

Derived at render time from raw data:

- `DailySummary` — day totals, entries, points by domain/type
- `WeekSummary` — week totals, avg per day, active days
- `StreakInfo` — current/longest streak per entry type

---

## Data Files

| File | Purpose |
|------|---------|
| `data/entry-types.json` | Activity type registry (30 types) |
| `data/sub-goals.json` | Sub-goal categorization (21 sub-goals) |
| `data/YYYY-MM-DD.json` | Daily entry instances |

---

## Migration from Legacy Format

The legacy deardiary.network export uses double-encoded JSON strings:
- `entryTypes` → `"{\"entryTypesArray\": [...]}"` 
- `entryInstances` → `"{\"entryInstancesMap\": {...}}"`

Import handled by `src/cli/import-legacy.ts`:
- Decodes double-encoded JSON
- Deduplicates type IDs (`brushteech→brushteeth`, `vitaminsupplements→vitamin`)
- Writes per-day JSON files
- Skips already-imported entries (idempotent)
