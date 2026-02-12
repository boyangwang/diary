/**
 * Natural Language → Primitive Operations parser.
 *
 * This is the ONLY module that uses LLM. Everything else is deterministic code.
 * 
 * Input: natural language string from user
 * Output: array of PrimitiveOperation objects
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { EntryType } from "../schema/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrimitiveOperation =
  | { kind: "ADD"; date: string; entryTypeId: string; points: number; notes: string }
  | { kind: "DELETE"; date: string; entryId: string }
  | { kind: "UPDATE"; date: string; entryId: string; field: string; value: string | number }
  | { kind: "NONE"; reason: string };

/**
 * Resolve an entry type from LLM output.
 * The LLM may return the id, title, or an alias — we try all.
 */
function resolveEntryType(input: string, entryTypes: EntryType[]): EntryType | undefined {
  const lower = input.toLowerCase().trim();

  // Direct ID match
  const byId = entryTypes.find((t) => t.id === lower);
  if (byId) return byId;

  // Title match (case-insensitive)
  const byTitle = entryTypes.find((t) => t.title.toLowerCase() === lower);
  if (byTitle) return byTitle;

  // Alias match
  const byAlias = entryTypes.find((t) => {
    const et = t as EntryType & { aliases?: string[] };
    return et.aliases?.some((a) => a.toLowerCase() === lower);
  });
  if (byAlias) return byAlias;

  // Partial match on id or title
  const byPartial = entryTypes.find(
    (t) => t.id.includes(lower) || lower.includes(t.id) ||
           t.title.toLowerCase().includes(lower) || lower.includes(t.title.toLowerCase())
  );
  if (byPartial) return byPartial;

  return undefined;
}

export interface ParseResult {
  operations: PrimitiveOperation[];
  raw: string; // The raw LLM response for debugging
}

// ---------------------------------------------------------------------------
// Entry Types Loader
// ---------------------------------------------------------------------------

const DATA_DIR = join(dirname(new URL(import.meta.url).pathname), "../../data");

let _entryTypesCache: EntryType[] | null = null;

async function loadEntryTypes(): Promise<EntryType[]> {
  if (_entryTypesCache) return _entryTypesCache;
  const raw = await readFile(join(DATA_DIR, "entry-types.json"), "utf-8");
  const parsed = JSON.parse(raw) as { entryTypes: EntryType[] };
  _entryTypesCache = parsed.entryTypes;
  return _entryTypesCache;
}

export function clearEntryTypesCache(): void {
  _entryTypesCache = null;
}

// ---------------------------------------------------------------------------
// System Prompt Builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(entryTypes: EntryType[], today: string, existingEntries?: string): string {
  const typeList = entryTypes.map((t) => {
    const et = t as EntryType & { parameterized?: boolean; defaultParamValue?: number; defaultParamUnit?: string; pointsPerUnit?: number; aliases?: string[] };
    const aliases = et.aliases?.join(", ") ?? "";
    if (et.parameterized) {
      return `  - ${t.id} (${t.title}): parameterized, default ${et.defaultParamValue}${et.defaultParamUnit} × ${et.pointsPerUnit} pts/${et.defaultParamUnit} = ${t.defaultPoints} pts. Domain: ${t.domain}. Aliases: ${aliases}`;
    }
    return `  - ${t.id} (${t.title}): fixed ${t.defaultPoints} pts. Domain: ${t.domain}. Aliases: ${aliases}`;
  }).join("\n");

  let existingSection = "";
  if (existingEntries) {
    existingSection = `\nExisting entries (for DELETE/UPDATE operations — use these IDs):\n${existingEntries}\n`;
  }

  return `You are a diary entry parser. Convert natural language into primitive operations.

Today's date: ${today}
Timezone: Asia/Singapore (UTC+8)

Available entry types:
${typeList}
${existingSection}
RULES:
1. Output ONLY valid JSON array of operations. No explanation, no markdown.
2. Operations are: ADD, DELETE, UPDATE, NONE
3. ADD format: {"kind":"ADD","date":"YYYY-MM-DD","entryTypeId":"<id>","points":<number>,"notes":"<text>"}
4. DELETE format: {"kind":"DELETE","date":"YYYY-MM-DD","entryId":"<exact id from existing entries>"}
5. UPDATE format: {"kind":"UPDATE","date":"YYYY-MM-DD","entryId":"<exact id>","field":"<points|notes>","value":<new value>}
6. NONE format: {"kind":"NONE","reason":"<why no operation>"} — use when input is not a diary entry
7. Default date is today (${today}) unless user says "yesterday", "2 days ago", etc.
8. For parameterized types: if user gives duration, calculate points = duration × pointsPerUnit. If no duration, use default.
9. For non-parameterized types: always use defaultPoints.
10. Extract notes from context (e.g., "gym with trainer" → notes: "with trainer")
11. NEVER interpret expressions of frustration/regret as delete commands. "I didn't do anything" = NONE, not DELETE.
12. Support both English and Chinese input.
13. If input mentions an activity not in the list, use the closest match or output NONE with a suggestion.`;
}

// ---------------------------------------------------------------------------
// LLM Call
// ---------------------------------------------------------------------------

export interface LLMProvider {
  chat(systemPrompt: string, userMessage: string): Promise<string>;
}

/**
 * OpenAI-compatible LLM provider.
 */
export function createOpenAIProvider(apiKey: string, model: string = "gpt-4o-mini"): LLMProvider {
  return {
    async chat(systemPrompt: string, userMessage: string): Promise<string> {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0,
          max_tokens: 1024,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI API error ${resp.status}: ${err}`);
      }
      const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
      return data.choices[0].message.content;
    },
  };
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parse natural language input into primitive operations.
 *
 * @param input - Natural language from user
 * @param llm - LLM provider for parsing
 * @param today - Today's date "YYYY-MM-DD" (defaults to Singapore time)
 * @param existingEntries - Optional formatted string of existing entries for DELETE/UPDATE
 */
export async function parseInput(
  input: string,
  llm: LLMProvider,
  today?: string,
  existingEntries?: string
): Promise<ParseResult> {
  const entryTypes = await loadEntryTypes();

  if (!today) {
    today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
  }

  const systemPrompt = buildSystemPrompt(entryTypes, today, existingEntries);
  const raw = await llm.chat(systemPrompt, input);

  // Parse the JSON response
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    let parsed = JSON.parse(cleaned);
    // Wrap single object in array
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }
    const operations = parsed as PrimitiveOperation[];

    // Validate and normalize each operation
    for (const op of operations) {
      if (op.kind === "ADD") {
        // Normalize entry type ID — LLM may return title instead of id
        const resolved = resolveEntryType(op.entryTypeId, entryTypes);
        if (resolved) {
          op.entryTypeId = resolved.id;
        } else {
          op.kind = "NONE" as any;
          (op as any).reason = `Unknown entry type: ${op.entryTypeId}`;
        }
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(op.date)) {
          op.date = today;
        }
      }
    }

    return { operations, raw };
  } catch {
    return {
      operations: [{ kind: "NONE", reason: `Failed to parse LLM response: ${raw}` }],
      raw,
    };
  }
}
