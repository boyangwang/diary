/**
 * CLI: Import legacy diary app data.
 *
 * Converts the old diary app export format into the new schema:
 * - Maps legacy entry types → new EntryType (with domain assignment)
 * - Converts entryInstancesMap → per-day JSON files
 * - Handles duplicates (brushteech→brushteeth, vitaminsupplements→vitamin)
 *
 * Usage: npm run import -- <path-to-legacy-export.json>
 */

// TODO: Implement in Phase 0
// - Read legacy export JSON
// - Parse loginUser, entryTypes, entryInstances
// - Map types to Harada domains
// - Deduplicate (merge brushteech into brushteeth, etc.)
// - Write data/entry-types.json
// - Write data/YYYY-MM-DD.json for each day

console.log("Import CLI not yet implemented. See docs/ROADMAP.md Phase 0.");
