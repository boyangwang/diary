/**
 * Core type definitions for the Diary life tracking system.
 *
 * These types define the data contracts used across all layers:
 * storage, computation, and rendering.
 */

// ---------------------------------------------------------------------------
// Harada Domains
// ---------------------------------------------------------------------------

/**
 * The 8 life domains from Boyang's Harada method framework.
 *
 * Outlive 4: physical, mental, sleep, eat
 * Headache 1: medical
 * Mundane 3: business, academic, methodology
 */
export type HaradaDomain =
  | "physical"     // 身体 — strength, cardio, flexibility, hygiene
  | "mental"       // 心理 — wellness, social, dog, relaxation
  | "sleep"        // 睡 — wind-down, sleep quality, timing
  | "eat"          // 吃 — fasting, diet discipline, safe foods
  | "medical"      // 医疗 — health screening, treatments, medication
  | "business"     // 业界 — work, trading, networking, PR, content
  | "academic"     // 学界 — learning, papers, institutional connections
  | "methodology"; // 鸡血 — productivity, habit systems, tools, rituals

export const HARADA_DOMAINS: readonly HaradaDomain[] = [
  "physical",
  "mental",
  "sleep",
  "eat",
  "medical",
  "business",
  "academic",
  "methodology",
] as const;

export const DOMAIN_LABELS: Record<HaradaDomain, { en: string; zh: string }> = {
  physical:    { en: "Physical",    zh: "身体" },
  mental:      { en: "Mental",      zh: "心理" },
  sleep:       { en: "Sleep",       zh: "睡" },
  eat:         { en: "Eat",         zh: "吃" },
  medical:     { en: "Medical",     zh: "医疗" },
  business:    { en: "Business",    zh: "业界" },
  academic:    { en: "Academic",    zh: "学界" },
  methodology: { en: "Methodology", zh: "鸡血" },
};

// ---------------------------------------------------------------------------
// Entry Types
// ---------------------------------------------------------------------------

/** Defines a trackable activity category. */
export interface EntryType {
  /** Unique slug, e.g., "gym", "brushteeth" */
  id: string;
  /** Display name, e.g., "Gym", "Brush Teeth" */
  title: string;
  /** Default points when logging */
  defaultPoints: number;
  /** Point increment granularity, e.g., 0.5 */
  pointStep: number;
  /** Expected frequency */
  routine: "Daily" | "Weekly" | "Adhoc";
  /** Harada method domain */
  domain: HaradaDomain;
  /** Gradient hex colors (no #), e.g., ["FC8D3C", "FF5912"] */
  themeColors: [string, string];
  /** Unix timestamp ms */
  createdAt: number;
  /** Unix timestamp ms */
  updatedAt: number;
}

/** The entry types registry file format. */
export interface EntryTypesFile {
  entryTypes: EntryType[];
}

// ---------------------------------------------------------------------------
// Entry Instances
// ---------------------------------------------------------------------------

/** A single logged activity instance. */
export interface EntryInstance {
  /** Unique ID: `${entryTypeId}-${ISO timestamp}-${random}` */
  id: string;
  /** Date string: "YYYY-MM-DD" */
  date: string;
  /** Reference to EntryType.id */
  entryTypeId: string;
  /** Actual points awarded (may differ from EntryType.defaultPoints) */
  points: number;
  /** Free text notes */
  notes: string;
  /** Unix timestamp ms */
  createdAt: number;
  /** Unix timestamp ms */
  updatedAt: number;
}

/** Daily data file format: data/YYYY-MM-DD.json */
export interface DailyFile {
  date: string;
  entries: EntryInstance[];
}

// ---------------------------------------------------------------------------
// Computed Types (not stored, derived at render time)
// ---------------------------------------------------------------------------

/** Summary of a single day. */
export interface DailySummary {
  date: string;
  entries: EntryInstance[];
  totalPoints: number;
  entryCount: number;
  pointsByDomain: Record<HaradaDomain, number>;
  pointsByType: Record<string, number>;
}

/** Streak information for a single entry type. */
export interface StreakInfo {
  entryTypeId: string;
  /** Current consecutive days (including today if logged) */
  currentStreak: number;
  /** All-time longest streak */
  longestStreak: number;
  /** Start date of longest streak: "YYYY-MM-DD" */
  longestStreakStart: string;
  /** End date of longest streak: "YYYY-MM-DD" */
  longestStreakEnd: string;
  /** Most recent date this type was logged: "YYYY-MM-DD" */
  lastLoggedDate: string;
  /** Was this type logged today? */
  isActiveToday: boolean;
}

/** Summary of a week (Monday–Sunday). */
export interface WeekSummary {
  weekStart: string; // Monday "YYYY-MM-DD"
  weekEnd: string;   // Sunday "YYYY-MM-DD"
  days: DailySummary[];
  totalPoints: number;
  avgPointsPerDay: number;
  activeDays: number;
  pointsByDomain: Record<HaradaDomain, number>;
}
