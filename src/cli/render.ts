/**
 * CLI: Regenerate dashboard.md from JSON data.
 *
 * Reads all daily JSON files, computes summaries + streaks,
 * and outputs the full dashboard as Markdown to stdout.
 *
 * Usage: npm run render
 * Usage: npm run render > data/dashboard.md
 */

import { readDailyFile, listDailyDates, readEntryTypes } from "../core/store.js";
import { computeDailySummary, computeWeekSummary, buildDomainLookup } from "../core/points.js";
import { computeStreaks } from "../core/streaks.js";
import { renderDashboard } from "../render/json-to-md.js";
import type { DailyFile, DailySummary } from "../schema/types.js";

// ---------------------------------------------------------------------------
// Date Helpers
// ---------------------------------------------------------------------------

function todaySGT(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
}

function getWeekBounds(dateStr: string): { weekStart: string; weekEnd: string } {
  const d = new Date(dateStr + "T00:00:00+08:00");
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start + "T00:00:00+08:00");
  const endDate = new Date(end + "T00:00:00+08:00");
  while (d <= endDate) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${dd}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function daysAgo(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00+08:00");
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const today = todaySGT();
  const { weekStart, weekEnd } = getWeekBounds(today);
  const weekDates = dateRange(weekStart, weekEnd);

  // Load entry types
  const { entryTypes } = await readEntryTypes();
  const domainLookup = buildDomainLookup(entryTypes);

  // Today
  const todayDaily = await readDailyFile(today);
  const todaySummary = computeDailySummary(todayDaily, domainLookup);

  // Week
  const weekDailySummaries: DailySummary[] = [];
  for (const date of weekDates) {
    const daily = await readDailyFile(date);
    weekDailySummaries.push(computeDailySummary(daily, domainLookup));
  }
  const weekSummary = computeWeekSummary(weekDailySummaries, weekStart, weekEnd);

  // Streaks (all data)
  const allDates = await listDailyDates();
  const allDailyFiles: DailyFile[] = [];
  for (const date of allDates) {
    allDailyFiles.push(await readDailyFile(date));
  }
  const streaks = computeStreaks(allDailyFiles, today);

  // Last 30 days
  const thirtyAgo = daysAgo(today, 29);
  const last30Dates = dateRange(thirtyAgo, today);
  const last30Days: DailySummary[] = [];
  for (const date of last30Dates) {
    const daily = await readDailyFile(date);
    last30Days.push(computeDailySummary(daily, domainLookup));
  }
  last30Days.reverse();

  // Render
  const md = renderDashboard({ today, todaySummary, weekSummary, streaks, entryTypes, last30Days });
  process.stdout.write(md);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
