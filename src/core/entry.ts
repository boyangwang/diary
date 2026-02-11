/**
 * Entry CRUD operations.
 *
 * Add, update, delete entry instances in daily files.
 */

import type { EntryInstance, DailyFile } from "../schema/types.js";
import { readDailyFile, writeDailyFile } from "./store.js";

/**
 * Generate a unique entry ID.
 * Format: `${entryTypeId}-${ISO timestamp}-${random}`
 */
export function generateEntryId(entryTypeId: string): string {
  const now = new Date().toISOString();
  const rand = Math.floor(Math.random() * 1000);
  return `${entryTypeId}-${now}-${rand}`;
}

/** Add one or more entries to a day. Returns the updated daily file. */
export async function addEntries(
  date: string,
  entries: Omit<EntryInstance, "id" | "createdAt" | "updatedAt">[]
): Promise<DailyFile> {
  const daily = await readDailyFile(date);
  const now = Date.now();

  for (const entry of entries) {
    const instance: EntryInstance = {
      id: generateEntryId(entry.entryTypeId),
      date,
      entryTypeId: entry.entryTypeId,
      points: entry.points,
      notes: entry.notes,
      createdAt: now,
      updatedAt: now,
    };
    daily.entries.push(instance);
  }

  await writeDailyFile(daily);
  return daily;
}

/** Update an existing entry by ID. Returns the updated daily file. */
export async function updateEntry(
  date: string,
  entryId: string,
  updates: Partial<Pick<EntryInstance, "points" | "notes" | "entryTypeId">>
): Promise<DailyFile> {
  const daily = await readDailyFile(date);
  const entry = daily.entries.find((e) => e.id === entryId);

  if (!entry) {
    throw new Error(`Entry ${entryId} not found in ${date}`);
  }

  if (updates.points !== undefined) entry.points = updates.points;
  if (updates.notes !== undefined) entry.notes = updates.notes;
  if (updates.entryTypeId !== undefined) entry.entryTypeId = updates.entryTypeId;
  entry.updatedAt = Date.now();

  await writeDailyFile(daily);
  return daily;
}

/** Delete an entry by ID. Returns the updated daily file. */
export async function deleteEntry(
  date: string,
  entryId: string
): Promise<DailyFile> {
  const daily = await readDailyFile(date);
  const idx = daily.entries.findIndex((e) => e.id === entryId);

  if (idx === -1) {
    throw new Error(`Entry ${entryId} not found in ${date}`);
  }

  daily.entries.splice(idx, 1);
  await writeDailyFile(daily);
  return daily;
}
