/**
 * Points aggregation.
 *
 * Compute daily totals, domain breakdowns, and weekly summaries.
 */

import type {
  DailyFile,
  DailySummary,
  WeekSummary,
  EntryType,
  HaradaDomain,
} from "../schema/types.js";
import { HARADA_DOMAINS } from "../schema/types.js";

/** Create an empty domain points map. */
function emptyDomainPoints(): Record<HaradaDomain, number> {
  const map: Record<string, number> = {};
  for (const d of HARADA_DOMAINS) map[d] = 0;
  return map as Record<HaradaDomain, number>;
}

/** Build a lookup map from entry type ID → domain. */
export function buildDomainLookup(
  entryTypes: EntryType[]
): Map<string, HaradaDomain> {
  const map = new Map<string, HaradaDomain>();
  for (const et of entryTypes) {
    map.set(et.id, et.domain);
  }
  return map;
}

/** Compute summary for a single day. */
export function computeDailySummary(
  daily: DailyFile,
  domainLookup: Map<string, HaradaDomain>
): DailySummary {
  const pointsByDomain = emptyDomainPoints();
  const pointsByType: Record<string, number> = {};
  let totalPoints = 0;

  for (const entry of daily.entries) {
    totalPoints += entry.points;

    // Aggregate by type
    pointsByType[entry.entryTypeId] =
      (pointsByType[entry.entryTypeId] ?? 0) + entry.points;

    // Aggregate by domain
    const domain = domainLookup.get(entry.entryTypeId);
    if (domain) {
      pointsByDomain[domain] += entry.points;
    }
  }

  return {
    date: daily.date,
    entries: daily.entries,
    totalPoints,
    entryCount: daily.entries.length,
    pointsByDomain,
    pointsByType,
  };
}

/**
 * Compute week summary from an array of daily summaries.
 * Expects 7 days (Mon-Sun), but handles partial weeks.
 */
export function computeWeekSummary(
  days: DailySummary[],
  weekStart: string,
  weekEnd: string
): WeekSummary {
  const pointsByDomain = emptyDomainPoints();
  let totalPoints = 0;
  let activeDays = 0;

  for (const day of days) {
    totalPoints += day.totalPoints;
    if (day.entryCount > 0) activeDays++;
    for (const domain of HARADA_DOMAINS) {
      pointsByDomain[domain] += day.pointsByDomain[domain];
    }
  }

  return {
    weekStart,
    weekEnd,
    days,
    totalPoints,
    avgPointsPerDay: activeDays > 0 ? totalPoints / activeDays : 0,
    activeDays,
    pointsByDomain,
  };
}
