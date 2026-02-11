/**
 * Streak calculation.
 *
 * Computes current and longest streaks for each entry type.
 * A streak = consecutive calendar days where an entry type was logged.
 */

import type { DailyFile, StreakInfo } from "../schema/types.js";

/**
 * Parse "YYYY-MM-DD" to a Date object (midnight UTC).
 * Using UTC to avoid timezone issues in date arithmetic.
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format Date to "YYYY-MM-DD". */
function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Get the day before a date string. */
function dayBefore(dateStr: string): string {
  const d = parseDate(dateStr);
  d.setUTCDate(d.getUTCDate() - 1);
  return formatDate(d);
}

/**
 * Compute streaks for all entry types across all daily files.
 *
 * @param dailyFiles - Array of daily files, sorted by date ascending
 * @param today - Today's date string ("YYYY-MM-DD")
 * @returns Map of entryTypeId → StreakInfo
 */
export function computeStreaks(
  dailyFiles: DailyFile[],
  today: string
): Map<string, StreakInfo> {
  // Build a set of dates each entry type was logged
  const typeDateSets = new Map<string, Set<string>>();

  for (const daily of dailyFiles) {
    for (const entry of daily.entries) {
      if (!typeDateSets.has(entry.entryTypeId)) {
        typeDateSets.set(entry.entryTypeId, new Set());
      }
      typeDateSets.get(entry.entryTypeId)!.add(daily.date);
    }
  }

  const results = new Map<string, StreakInfo>();

  for (const [typeId, dateSet] of typeDateSets) {
    const sortedDates = Array.from(dateSet).sort();

    if (sortedDates.length === 0) continue;

    // Compute longest streak
    let longestStreak = 1;
    let longestStart = sortedDates[0];
    let longestEnd = sortedDates[0];
    let currentRunStart = sortedDates[0];
    let currentRunLength = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const expected = dayBefore(sortedDates[i]);
      if (expected === sortedDates[i - 1]) {
        // Consecutive
        currentRunLength++;
      } else {
        // Break
        if (currentRunLength > longestStreak) {
          longestStreak = currentRunLength;
          longestStart = currentRunStart;
          longestEnd = sortedDates[i - 1];
        }
        currentRunStart = sortedDates[i];
        currentRunLength = 1;
      }
    }
    // Final run check
    if (currentRunLength > longestStreak) {
      longestStreak = currentRunLength;
      longestStart = currentRunStart;
      longestEnd = sortedDates[sortedDates.length - 1];
    }

    // Compute current streak (counting backwards from today)
    let currentStreak = 0;
    let checkDate = today;
    const isActiveToday = dateSet.has(today);

    if (isActiveToday) {
      currentStreak = 1;
      checkDate = dayBefore(today);
      while (dateSet.has(checkDate)) {
        currentStreak++;
        checkDate = dayBefore(checkDate);
      }
    } else {
      // Check if yesterday was logged (streak might still be "alive" if today isn't over)
      // For now, if not logged today, current streak = 0
      currentStreak = 0;
    }

    results.set(typeId, {
      entryTypeId: typeId,
      currentStreak,
      longestStreak,
      longestStreakStart: longestStart,
      longestStreakEnd: longestEnd,
      lastLoggedDate: sortedDates[sortedDates.length - 1],
      isActiveToday,
    });
  }

  return results;
}
