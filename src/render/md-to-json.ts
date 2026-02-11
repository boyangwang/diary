/**
 * Markdown → JSON parser.
 *
 * Parses a dashboard Markdown file back into structured data.
 * Used for:
 * - Importing data from manually edited Markdown
 * - Migration from other formats
 * - Roundtrip verification (JSON → MD → JSON should preserve data)
 *
 * NOTE: This parses the "Today" section of the dashboard format.
 * For full roundtrip of all sections, extend as needed.
 */

import type { EntryInstance } from "../schema/types.js";

/** Result of parsing a Markdown dashboard's Today section. */
export interface ParsedDay {
  date: string;
  entries: Array<{
    entryTypeId: string;
    points: number;
    notes: string;
  }>;
}

/**
 * Parse the "Today" section of a dashboard Markdown file.
 *
 * Expected format:
 * ```
 * ## Today — YYYY-MM-DD (DayName)
 * | Activity | Points | Notes |
 * |----------|--------|-------|
 * | Gym      | 1.5    | ...   |
 * ```
 */
export function parseTodaySection(markdown: string): ParsedDay | null {
  const lines = markdown.split("\n");

  // Find the "Today" heading
  const todayIdx = lines.findIndex((l) =>
    /^## Today — (\d{4}-\d{2}-\d{2})/.test(l)
  );
  if (todayIdx === -1) return null;

  const dateMatch = lines[todayIdx].match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) return null;
  const date = dateMatch[1];

  // Find table rows (skip header and separator)
  const entries: ParsedDay["entries"] = [];
  let i = todayIdx + 1;

  // Skip until table header
  while (i < lines.length && !lines[i].startsWith("| Activity")) i++;
  if (i >= lines.length) return { date, entries };
  i++; // Skip header
  if (i < lines.length && lines[i].startsWith("|---")) i++; // Skip separator

  // Parse table rows
  while (i < lines.length && lines[i].startsWith("|")) {
    const cols = lines[i]
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cols.length >= 3) {
      const entryTypeId = cols[0].toLowerCase().replace(/\s+/g, "");
      const points = parseFloat(cols[1]) || 0;
      const notes = cols[2] === "—" ? "" : cols[2];
      entries.push({ entryTypeId, points, notes });
    }
    i++;
  }

  return { date, entries };
}

/**
 * Parse an entire Markdown file containing multiple day tables.
 *
 * This is a simpler format for bulk import:
 * ```
 * ## YYYY-MM-DD
 * | Activity | Points | Notes |
 * ...
 * ```
 */
export function parseMultipleDays(markdown: string): ParsedDay[] {
  const lines = markdown.split("\n");
  const days: ParsedDay[] = [];
  let currentDay: ParsedDay | null = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // New day heading
    const dayMatch = line.match(/^## (\d{4}-\d{2}-\d{2})/);
    if (dayMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = { date: dayMatch[1], entries: [] };
      inTable = false;
      continue;
    }

    if (!currentDay) continue;

    // Table header
    if (line.startsWith("| Activity") || line.startsWith("| activity")) {
      inTable = true;
      continue;
    }

    // Table separator
    if (line.startsWith("|---")) continue;

    // Table row
    if (inTable && line.startsWith("|")) {
      const cols = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (cols.length >= 2) {
        const entryTypeId = cols[0].toLowerCase().replace(/\s+/g, "");
        const points = parseFloat(cols[1]) || 0;
        const notes = cols.length >= 3 && cols[2] !== "—" ? cols[2] : "";
        currentDay.entries.push({ entryTypeId, points, notes });
      }
    } else {
      inTable = false;
    }
  }

  if (currentDay) days.push(currentDay);
  return days;
}
