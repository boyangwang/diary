/**
 * Core type definitions for the Diary life tracking system.
 *
 * LOrder Framework (Boyang's adaptation of Harada OW64):
 *   Goal (1): Super Healthy Longevity 120
 *   Subgoals (8): Physical, Mental, Sleep, Eat, Medical, Business, Academic, Methodology
 *   EntryTypes (many): Body-Weight Lifting, Mind-Home Wellness, etc.
 *   EntryItems: individual logged instances
 */

// ---------------------------------------------------------------------------
// Subgoals (the 8 LOrder domains)
// ---------------------------------------------------------------------------

/**
 * The 8 subgoals from LOrder (Boyang's Harada OW64 adaptation).
 *
 * Outlive 5: physical, mental, sleep, eat, medical
 * IRL 3: business, academic, methodology
 */
export type Subgoal =
  | "physical"     // 身体 Body-  (Outlive)
  | "mental"       // 心理 Mind-  (Outlive)
  | "sleep"        // 睡   Zzz-   (Outlive)
  | "eat"          // 吃   Eat-   (Outlive)
  | "medical"      // 医疗 Med-   (Outlive)
  | "business"     // 业界 Biz-   (IRL)
  | "academic"     // 学界 Sci-   (IRL)
  | "methodology"; // 方法论 Logi- (IRL)

export const SUBGOALS: readonly Subgoal[] = [
  "physical",
  "mental",
  "sleep",
  "eat",
  "medical",
  "business",
  "academic",
  "methodology",
] as const;

export const SUBGOAL_META: Record<Subgoal, { en: string; zh: string; prefix: string; category: "Outlive" | "IRL" }> = {
  physical:    { en: "Physical",    zh: "身体",   prefix: "Body-", category: "Outlive" },
  mental:      { en: "Mental",      zh: "心理",   prefix: "Mind-", category: "Outlive" },
  sleep:       { en: "Sleep",       zh: "睡",     prefix: "Zzz-",  category: "Outlive" },
  eat:         { en: "Eat",         zh: "吃",     prefix: "Eat-",  category: "Outlive" },
  medical:     { en: "Medical",     zh: "医疗",   prefix: "Med-",  category: "Outlive" },
  business:    { en: "Business",    zh: "业界",   prefix: "Biz-",  category: "IRL" },
  academic:    { en: "Academic",    zh: "学界",   prefix: "Sci-",  category: "IRL" },
  methodology: { en: "Methodology", zh: "方法论", prefix: "Logi-", category: "IRL" },
};

// Backwards compat alias
export type HaradaDomain = Subgoal;
export const HARADA_DOMAINS = SUBGOALS;
export const DOMAIN_LABELS: Record<Subgoal, { en: string; zh: string }> = Object.fromEntries(
  Object.entries(SUBGOAL_META).map(([k, v]) => [k, { en: v.en, zh: v.zh }])
) as Record<Subgoal, { en: string; zh: string }>;

// ---------------------------------------------------------------------------
// Entry Types
// ---------------------------------------------------------------------------

/** Defines a trackable activity category. */
export interface EntryType {
  /** Unique slug, e.g., "body-weight-lifting", "mind-home-wellness" */
  id: string;
  /** Display name with prefix, e.g., "Body-Weight Lifting" */
  title: string;
  /** Default points when logging */
  defaultPoints: number;
  /** Point increment granularity, e.g., 0.5 */
  pointStep: number;
  /** Expected frequency */
  routine: "Daily" | "Weekly" | "Adhoc";
  /** LOrder subgoal */
  domain: Subgoal;
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
// Entry Instances (EntryItems in LOrder terminology)
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
  pointsByDomain: Record<Subgoal, number>;
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
  pointsByDomain: Record<Subgoal, number>;
}
