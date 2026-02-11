/**
 * Diary — Life Tracking System
 *
 * Main entry point. Re-exports core modules for programmatic use.
 */

export type {
  HaradaDomain,
  EntryType,
  EntryTypesFile,
  EntryInstance,
  DailyFile,
  DailySummary,
  StreakInfo,
  WeekSummary,
} from "./schema/types.js";

export { HARADA_DOMAINS, DOMAIN_LABELS } from "./schema/types.js";

export {
  readDailyFile,
  writeDailyFile,
  listDailyDates,
  readEntryTypes,
  writeEntryTypes,
} from "./core/store.js";

export { addEntries, updateEntry, deleteEntry } from "./core/entry.js";

export {
  computeDailySummary,
  computeWeekSummary,
  buildDomainLookup,
} from "./core/points.js";

export { computeStreaks } from "./core/streaks.js";

export { renderDashboard } from "./render/json-to-md.js";

export { parseTodaySection, parseMultipleDays } from "./render/md-to-json.js";
