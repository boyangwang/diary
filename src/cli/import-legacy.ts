/**
 * CLI: Import legacy diary app data.
 *
 * Converts the old deardiary.network export format into the new schema.
 *
 * Legacy format (double-encoded JSON):
 * {
 *   "loginUser": "...",
 *   "entryTypes": "{\"entryTypesArray\": [...]}",
 *   "entryInstances": "{\"entryInstancesMap\": {\"YYYY-MM-DD\": [...]}}"
 * }
 *
 * New format:
 * - data/YYYY-MM-DD.json for each day with entries
 * - data/entry-types.json updated with any missing types
 *
 * Usage: npx tsx src/cli/import-legacy.ts <path-to-legacy-export.json>
 */

import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { EntryInstance, DailyFile, EntryType } from "../schema/types.js";
import { readDailyFile, writeDailyFile, readEntryTypes, writeEntryTypes, getDataDir } from "../core/store.js";

// ---------------------------------------------------------------------------
// Legacy Types
// ---------------------------------------------------------------------------

interface LegacyEntryType {
  id: string;
  title: string;
  defaultPoints: number;
  pointStep: number;
  routine: string;
  themeColors: [string, string];
  createdAt: number;
  updatedAt: number;
}

interface LegacyEntryInstance {
  id: string;
  entryTypeId: string;
  createdAt: number;
  updatedAt: number;
  points: number;
  notes: string;
}

interface LegacyExport {
  loginUser: string;
  entryTypes: string;      // Double-encoded JSON
  entryInstances: string;  // Double-encoded JSON
  reminderRecords?: string;
  uiState?: string;
  _persist?: string;
}

// ---------------------------------------------------------------------------
// Deduplication Map (legacy ID → canonical ID)
// ---------------------------------------------------------------------------

// Map legacy entry type IDs → new LOrder IDs
const DEDUP_MAP: Record<string, string> = {
  // Deduplication
  brushteech: "med-tooth",
  brushteeth: "med-tooth",
  vitaminsupplements: "med-eye", // was vitamin supplements, closest match
  vitamin: "med-eye", // vitamin/supplements → general medical daily
  // Legacy → LOrder mapping
  gym: "body-gym",
  badminton: "body-badminton",
  walk: "body-zone2",
  physio: "body-rehab",
  shower: "body-gym", // hygiene, mapped to gym adhoc for now
  meditation: "mind-home-wellness",
  interpersonal: "mind-friends",
  dreamdiary: "mind-home-wellness",
  tourism: "mind-friends",
  abstinence: "mind-home-wellness",
  mushroom: "mind-psychedelics",
  sleepearly: "zzz-winddown",
  nosupper: "eat-fasting",
  eatless: "eat-safefood",
  sinusrinse: "med-nose",
  medical: "med-screening",
  work: "biz-office",
  dev: "logi-productivity",
  chore: "mind-clean",
  digest: "sci-learn",
  read: "sci-learn",
  academic: "sci-learn",
  lantingflorilegium: "sci-publish",
  heresyanthology: "sci-publish",
  serendipity: "logi-habit",
};

function canonicalId(legacyId: string): string {
  return DEDUP_MAP[legacyId] ?? legacyId;
}

// ---------------------------------------------------------------------------
// Import Logic
// ---------------------------------------------------------------------------

async function importLegacy(exportPath: string): Promise<void> {
  console.log(`\n📦 Importing legacy export: ${exportPath}`);

  // Read and parse
  const rawFile = await readFile(exportPath, "utf-8");
  const exportData = JSON.parse(rawFile) as LegacyExport;

  // Double-decode the inner JSON strings
  const entryTypesData = JSON.parse(exportData.entryTypes) as { entryTypesArray: LegacyEntryType[] };
  const entryInstancesData = JSON.parse(exportData.entryInstances) as { entryInstancesMap: Record<string, LegacyEntryInstance[]> };

  const legacyTypes = entryTypesData.entryTypesArray;
  const instancesMap = entryInstancesData.entryInstancesMap;

  console.log(`  Legacy entry types: ${legacyTypes.length}`);
  console.log(`  Date slots: ${Object.keys(instancesMap).length}`);

  // Count entries
  let totalEntries = 0;
  let nonEmptyDays = 0;
  const dates = Object.keys(instancesMap).sort();

  for (const date of dates) {
    const entries = instancesMap[date];
    if (entries.length > 0) {
      nonEmptyDays++;
      totalEntries += entries.length;
    }
  }
  console.log(`  Non-empty days: ${nonEmptyDays}`);
  console.log(`  Total entries: ${totalEntries}`);

  if (dates.length > 0) {
    console.log(`  Date range: ${dates[0]} → ${dates[dates.length - 1]}`);
  }

  // Load existing entry types for reference
  const existingTypes = await readEntryTypes();
  const existingTypeIds = new Set(existingTypes.entryTypes.map((t) => t.id));

  // Track which legacy types are NOT in the new registry
  const missingTypes: LegacyEntryType[] = [];
  const dedupStats: Record<string, number> = {};

  for (const lt of legacyTypes) {
    const canonical = canonicalId(lt.id);
    if (canonical !== lt.id) {
      dedupStats[`${lt.id} → ${canonical}`] = 0;
    }
    if (!existingTypeIds.has(canonical)) {
      missingTypes.push(lt);
    }
  }

  if (missingTypes.length > 0) {
    console.log(`\n⚠️  ${missingTypes.length} legacy types NOT in current registry:`);
    for (const mt of missingTypes) {
      console.log(`    - ${mt.id} (${mt.title})`);
    }
    console.log(`  These entries will be imported as-is. Add them to entry-types.json to track properly.`);
  }

  // Ensure data dir exists
  await mkdir(getDataDir(), { recursive: true });

  // Import each day
  let importedDays = 0;
  let importedEntries = 0;
  let skippedDuplicates = 0;

  for (const date of dates) {
    const legacyEntries = instancesMap[date];
    if (legacyEntries.length === 0) continue;

    // Read existing daily file (may already have entries)
    const existing = await readDailyFile(date);
    const existingIds = new Set(existing.entries.map((e) => e.id));

    const newEntries: EntryInstance[] = [];

    for (const le of legacyEntries) {
      const canonType = canonicalId(le.entryTypeId);

      // Track dedup
      if (canonType !== le.entryTypeId) {
        const key = `${le.entryTypeId} → ${canonType}`;
        dedupStats[key] = (dedupStats[key] ?? 0) + 1;
      }

      // Build new entry ID (reuse legacy ID but normalize the type)
      const entryId = canonType !== le.entryTypeId
        ? le.id.replace(le.entryTypeId, canonType)
        : le.id;

      // Skip if already imported
      if (existingIds.has(entryId) || existingIds.has(le.id)) {
        skippedDuplicates++;
        continue;
      }

      const instance: EntryInstance = {
        id: entryId,
        date,
        entryTypeId: canonType,
        points: le.points,
        notes: le.notes ?? "",
        createdAt: le.createdAt,
        updatedAt: le.updatedAt,
      };

      newEntries.push(instance);
    }

    if (newEntries.length > 0) {
      existing.entries.push(...newEntries);
      await writeDailyFile(existing);
      importedDays++;
      importedEntries += newEntries.length;
    }
  }

  // Report
  console.log(`\n✅ Import complete!`);
  console.log(`  Days written: ${importedDays}`);
  console.log(`  Entries imported: ${importedEntries}`);
  if (skippedDuplicates > 0) {
    console.log(`  Duplicates skipped: ${skippedDuplicates}`);
  }

  if (Object.keys(dedupStats).length > 0) {
    console.log(`\n🔀 Deduplication:`);
    for (const [mapping, count] of Object.entries(dedupStats)) {
      console.log(`    ${mapping}: ${count} entries remapped`);
    }
  }

  console.log(`\nData directory: ${getDataDir()}`);
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: npx tsx src/cli/import-legacy.ts <path-to-legacy-export.json>");
  process.exit(1);
}

const exportPath = args[0];
if (!existsSync(exportPath)) {
  console.error(`File not found: ${exportPath}`);
  process.exit(1);
}

importLegacy(exportPath).catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
