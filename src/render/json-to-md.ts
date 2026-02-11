/**
 * JSON → Markdown renderer.
 *
 * Reads JSON data and produces a human-readable Markdown dashboard
 * with a fixed, consistent structure.
 *
 * This is the PRIMARY view layer — what Boyang sees every day.
 */

import type {
  DailySummary,
  WeekSummary,
  StreakInfo,
  EntryType,
  HaradaDomain,
} from "../schema/types.js";
import { DOMAIN_LABELS } from "../schema/types.js";

// ---------------------------------------------------------------------------
// Main Render Function
// ---------------------------------------------------------------------------

export interface RenderInput {
  /** Today's date "YYYY-MM-DD" */
  today: string;
  /** Today's summary */
  todaySummary: DailySummary;
  /** This week's summary */
  weekSummary: WeekSummary;
  /** Streak info for all entry types */
  streaks: Map<string, StreakInfo>;
  /** Entry type definitions (for display names) */
  entryTypes: EntryType[];
  /** Last 30 days of daily summaries (newest first) */
  last30Days: DailySummary[];
}

/** Render the full dashboard Markdown. */
export function renderDashboard(input: RenderInput): string {
  const { today, todaySummary, weekSummary, streaks, entryTypes, last30Days } =
    input;

  const typeLookup = new Map(entryTypes.map((t) => [t.id, t]));
  const now = new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
  const dayName = new Date(today + "T00:00:00+08:00").toLocaleDateString(
    "en-SG",
    { weekday: "long", timeZone: "Asia/Singapore" }
  );

  const sections: string[] = [];

  // Header
  sections.push(`# 📊 Life Dashboard`);
  sections.push(`> Last updated: ${now} (SGT)\n`);

  // Today
  sections.push(renderToday(todaySummary, dayName, typeLookup));

  // Streaks
  sections.push(renderStreaks(streaks, typeLookup));

  // This Week
  sections.push(renderWeek(weekSummary, typeLookup));

  // Domain Summary
  sections.push(renderDomains(weekSummary));

  // Last 30 Days
  sections.push(renderLast30(last30Days));

  return sections.join("\n---\n\n");
}

// ---------------------------------------------------------------------------
// Section Renderers
// ---------------------------------------------------------------------------

function renderToday(
  summary: DailySummary,
  dayName: string,
  typeLookup: Map<string, EntryType>
): string {
  const lines: string[] = [];
  lines.push(`## Today — ${summary.date} (${dayName})\n`);

  if (summary.entries.length === 0) {
    lines.push("*No entries yet today.*\n");
  } else {
    lines.push("| Activity | Points | Notes |");
    lines.push("|----------|--------|-------|");
    for (const entry of summary.entries) {
      const type = typeLookup.get(entry.entryTypeId);
      const name = type?.title ?? entry.entryTypeId;
      const notes = entry.notes || "—";
      lines.push(`| ${name} | ${entry.points} | ${notes} |`);
    }
    lines.push("");
    lines.push(`**Total: ${summary.totalPoints} pts** (${summary.entryCount} entries)`);

    // Domain breakdown
    const domainParts: string[] = [];
    for (const [domain, pts] of Object.entries(summary.pointsByDomain)) {
      if (pts > 0) {
        const label = DOMAIN_LABELS[domain as HaradaDomain];
        domainParts.push(`${label.en} ${label.zh} ${pts}`);
      }
    }
    if (domainParts.length > 0) {
      lines.push(`\nBy domain: ${domainParts.join(" · ")}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function renderStreaks(
  streaks: Map<string, StreakInfo>,
  typeLookup: Map<string, EntryType>
): string {
  const lines: string[] = [];
  lines.push("## Streaks 🔥\n");

  const sorted = Array.from(streaks.values()).sort(
    (a, b) => b.currentStreak - a.currentStreak
  );

  if (sorted.length === 0) {
    lines.push("*No streak data yet.*\n");
  } else {
    lines.push("| Activity | Current | Best | Last Logged | Status |");
    lines.push("|----------|---------|------|-------------|--------|");
    for (const s of sorted) {
      const type = typeLookup.get(s.entryTypeId);
      const name = type?.title ?? s.entryTypeId;
      const status = s.isActiveToday ? "✅" : "⚠️";
      lines.push(
        `| ${name} | ${s.currentStreak}d | ${s.longestStreak}d | ${s.lastLoggedDate} | ${status} |`
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

function renderWeek(
  week: WeekSummary,
  typeLookup: Map<string, EntryType>
): string {
  const lines: string[] = [];
  lines.push(
    `## This Week (${week.weekStart} → ${week.weekEnd})\n`
  );

  lines.push("| Day | Date | Points | Entries |");
  lines.push("|-----|------|--------|---------|");

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < week.days.length; i++) {
    const day = week.days[i];
    const name = dayNames[i] ?? "???";
    const pts = day.totalPoints > 0 ? String(day.totalPoints) : "—";
    const count = day.entryCount > 0 ? String(day.entryCount) : "—";
    lines.push(`| ${name} | ${day.date} | ${pts} | ${count} |`);
  }

  lines.push("");
  lines.push(
    `**Week Total: ${week.totalPoints} pts** · ` +
      `Avg: ${week.avgPointsPerDay.toFixed(1)}/day · ` +
      `${week.activeDays}/7 active days`
  );

  lines.push("");
  return lines.join("\n");
}

function renderDomains(week: WeekSummary): string {
  const lines: string[] = [];
  lines.push("## Domain Summary (This Week)\n");

  const total = week.totalPoints || 1; // Avoid division by zero

  lines.push("| Domain | Points | % |");
  lines.push("|--------|--------|---|");

  for (const [domain, pts] of Object.entries(week.pointsByDomain)) {
    if (pts > 0) {
      const label = DOMAIN_LABELS[domain as HaradaDomain];
      const pct = ((pts / total) * 100).toFixed(0);
      lines.push(`| ${label.en} ${label.zh} | ${pts} | ${pct}% |`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function renderLast30(days: DailySummary[]): string {
  const lines: string[] = [];
  lines.push("## Last 30 Days\n");

  if (days.length === 0) {
    lines.push("*No historical data yet.*\n");
    return lines.join("\n");
  }

  lines.push("| Date | Points | Entries |");
  lines.push("|------|--------|---------|");

  for (const day of days) {
    const pts = day.totalPoints > 0 ? String(day.totalPoints) : "—";
    const count = day.entryCount > 0 ? String(day.entryCount) : "—";
    lines.push(`| ${day.date} | ${pts} | ${count} |`);
  }

  lines.push("");
  return lines.join("\n");
}
