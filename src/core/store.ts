/**
 * File-based JSON data store.
 *
 * Handles reading/writing daily entry files and the entry types registry.
 * All file operations use atomic writes (write-to-tmp + rename).
 */

import { readFile, writeFile, readdir, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { DailyFile, EntryTypesFile } from "../schema/types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DATA_DIR = join(dirname(new URL(import.meta.url).pathname), "../../data");

export function getDataDir(): string {
  return DATA_DIR;
}

// ---------------------------------------------------------------------------
// Daily Files
// ---------------------------------------------------------------------------

function dailyFilePath(date: string): string {
  return join(DATA_DIR, `${date}.json`);
}

/** Read a daily file. Returns empty day if file doesn't exist. */
export async function readDailyFile(date: string): Promise<DailyFile> {
  const path = dailyFilePath(date);
  if (!existsSync(path)) {
    return { date, entries: [] };
  }
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as DailyFile;
}

/** Write a daily file atomically (tmp + rename). */
export async function writeDailyFile(data: DailyFile): Promise<void> {
  const path = dailyFilePath(data.date);
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp.${Date.now()}`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  await rename(tmp, path);
}

/** List all daily file dates available in data dir. */
export async function listDailyDates(): Promise<string[]> {
  if (!existsSync(DATA_DIR)) return [];
  const files = await readdir(DATA_DIR);
  return files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(".json", ""))
    .sort();
}

// ---------------------------------------------------------------------------
// Entry Types Registry
// ---------------------------------------------------------------------------

function entryTypesPath(): string {
  return join(DATA_DIR, "entry-types.json");
}

/** Read the entry types registry. Returns empty if not found. */
export async function readEntryTypes(): Promise<EntryTypesFile> {
  const path = entryTypesPath();
  if (!existsSync(path)) {
    return { entryTypes: [] };
  }
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as EntryTypesFile;
}

/** Write the entry types registry atomically. */
export async function writeEntryTypes(data: EntryTypesFile): Promise<void> {
  const path = entryTypesPath();
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp.${Date.now()}`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  await rename(tmp, path);
}
