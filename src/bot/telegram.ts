/**
 * Telegram Bot for Diary.
 *
 * Dedicated bot — every message is diary input.
 * /status = render all data as Markdown.
 *
 * Uses long-polling (no webhook needed).
 */

import type { EntryInstance } from "../schema/types.js";
import { readDailyFile, writeDailyFile, listDailyDates, readEntryTypes } from "../core/store.js";
import { addEntries } from "../core/entry.js";
import { computeDailySummary, buildDomainLookup } from "../core/points.js";
import { computeStreaks } from "../core/streaks.js";
import { renderDashboard } from "../render/json-to-md.js";
import { parseInput, createOpenAIProvider, type PrimitiveOperation, type LLMProvider } from "../parser/parse.js";

// ---------------------------------------------------------------------------
// Telegram API Helpers
// ---------------------------------------------------------------------------

const BOT_TOKEN = process.env.DIARY_BOT_TOKEN!;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ALLOWED_USER_ID = 411364623; // Boyang

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string };
    chat: { id: number };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

async function tgApi(method: string, body?: Record<string, unknown>): Promise<any> {
  const resp = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await resp.json() as Record<string, unknown>;
  if (!data.ok) {
    console.error(`Telegram API error [${method}]:`, data);
  }
  return data;
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<any> {
  // Telegram message limit is 4096 chars
  if (text.length > 4000) {
    // Split into chunks
    const chunks = splitMessage(text, 4000);
    let lastResult;
    for (const chunk of chunks) {
      lastResult = await tgApi("sendMessage", {
        chat_id: chatId,
        text: chunk,
        parse_mode: "Markdown",
        ...(replyMarkup && chunk === chunks[chunks.length - 1] ? { reply_markup: replyMarkup } : {}),
      });
    }
    return lastResult;
  }
  return tgApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

function splitMessage(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    // Find a good split point (newline)
    let splitAt = remaining.lastIndexOf("\n", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  return chunks;
}

async function answerCallback(callbackId: string, text?: string): Promise<void> {
  await tgApi("answerCallbackQuery", { callback_query_id: callbackId, text });
}

// ---------------------------------------------------------------------------
// Pending Operations State
// ---------------------------------------------------------------------------

interface PendingState {
  chatId: number;
  operations: PrimitiveOperation[];
}

let pendingOps: PendingState | null = null;

// ---------------------------------------------------------------------------
// Format Operations for Display
// ---------------------------------------------------------------------------

function formatOperations(ops: PrimitiveOperation[]): string {
  const lines = ops.map((op, i) => {
    if (op.kind === "ADD") {
      const notes = op.notes ? ` "${op.notes}"` : "";
      return `${i + 1}. ➕ ADD  ${op.date}  ${op.entryTypeId}  ${op.points} pts${notes}`;
    }
    if (op.kind === "DELETE") {
      return `${i + 1}. ❌ DELETE  ${op.date}  ${op.entryId}`;
    }
    if (op.kind === "UPDATE") {
      return `${i + 1}. ✏️ UPDATE  ${op.date}  ${op.entryId}  ${op.field}=${op.value}`;
    }
    if (op.kind === "NONE") {
      return `${i + 1}. ⚠️ No operation: ${op.reason}`;
    }
    return `${i + 1}. ❓ Unknown operation`;
  });

  return "📋 *Mapped operations:*\n```\n" + lines.join("\n") + "\n```";
}

// ---------------------------------------------------------------------------
// Execute Operations
// ---------------------------------------------------------------------------

async function executeOperations(ops: PrimitiveOperation[]): Promise<string> {
  const results: string[] = [];
  let totalPoints = 0;
  let addCount = 0;

  for (const op of ops) {
    if (op.kind === "ADD") {
      await addEntries(op.date, [{
        entryTypeId: op.entryTypeId,
        points: op.points,
        notes: op.notes,
        date: op.date,
      }]);
      totalPoints += op.points;
      addCount++;
      results.push(`✅ Added ${op.entryTypeId} ${op.points} pts to ${op.date}`);
    }
    if (op.kind === "DELETE") {
      try {
        const daily = await readDailyFile(op.date);
        const idx = daily.entries.findIndex((e) => e.id === op.entryId);
        if (idx !== -1) {
          const removed = daily.entries.splice(idx, 1)[0];
          await writeDailyFile(daily);
          results.push(`✅ Deleted ${removed.entryTypeId} from ${op.date}`);
        } else {
          results.push(`⚠️ Entry ${op.entryId} not found in ${op.date}`);
        }
      } catch (e) {
        results.push(`⚠️ Error deleting: ${e}`);
      }
    }
    if (op.kind === "UPDATE") {
      try {
        const daily = await readDailyFile(op.date);
        const entry = daily.entries.find((e) => e.id === op.entryId);
        if (entry) {
          if (op.field === "points") entry.points = Number(op.value);
          else if (op.field === "notes") entry.notes = String(op.value);
          entry.updatedAt = Date.now();
          await writeDailyFile(daily);
          results.push(`✅ Updated ${entry.entryTypeId} ${op.field}=${op.value} on ${op.date}`);
        } else {
          results.push(`⚠️ Entry ${op.entryId} not found in ${op.date}`);
        }
      } catch (e) {
        results.push(`⚠️ Error updating: ${e}`);
      }
    }
  }

  if (addCount > 0) {
    results.push(`\n📊 *Total: ${addCount} entries, ${totalPoints} pts*`);
  }

  return results.join("\n");
}

// ---------------------------------------------------------------------------
// Status Command
// ---------------------------------------------------------------------------

async function handleStatus(chatId: number): Promise<void> {
  const dates = await listDailyDates();

  if (dates.length === 0) {
    await sendMessage(chatId, "📭 No data yet. Send me your first diary entry!");
    return;
  }

  const entryTypesFile = await readEntryTypes();
  const domainLookup = buildDomainLookup(entryTypesFile.entryTypes);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

  // Load all daily files
  const dailyFiles = await Promise.all(dates.map((d) => readDailyFile(d)));
  const dailySummaries = dailyFiles.map((df) => computeDailySummary(df, domainLookup));

  // Compute streaks
  const streaks = computeStreaks(dailyFiles, today);

  // Week summary (current week)
  const todayDate = new Date(today + "T00:00:00+08:00");
  const mondayOffset = (todayDate.getDay() + 6) % 7;
  const monday = new Date(todayDate);
  monday.setDate(monday.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    const summary = dailySummaries.find((s) => s.date === ds);
    if (summary) {
      weekDays.push(summary);
    } else {
      weekDays.push(computeDailySummary({ date: ds, entries: [] }, domainLookup));
    }
  }

  const { computeWeekSummary } = await import("../core/points.js");
  const weekSummary = computeWeekSummary(weekDays, weekStart, weekEnd);

  // Today summary
  const todaySummary = dailySummaries.find((s) => s.date === today)
    ?? computeDailySummary({ date: today, entries: [] }, domainLookup);

  // Last 30 days
  const last30 = dailySummaries.slice(-30).reverse();

  const markdown = renderDashboard({
    today,
    todaySummary,
    weekSummary,
    streaks,
    entryTypes: entryTypesFile.entryTypes,
    last30Days: last30,
  });

  await sendMessage(chatId, markdown);
}

// ---------------------------------------------------------------------------
// Message Handler
// ---------------------------------------------------------------------------

async function handleMessage(update: TelegramUpdate): Promise<void> {
  const msg = update.message;
  if (!msg?.text || msg.from.id !== ALLOWED_USER_ID) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // /status command
  if (text === "/status" || text === "/diary status") {
    await handleStatus(chatId);
    return;
  }

  // /start command
  if (text === "/start") {
    await sendMessage(chatId, "🦮 *Diary Bot Ready*\n\nSend me what you did today and I'll log it.\nUse /status to see all your data.");
    return;
  }

  // /today command — show today's entries
  if (text === "/today") {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    const daily = await readDailyFile(today);
    if (daily.entries.length === 0) {
      await sendMessage(chatId, `📭 No entries for ${today} yet.`);
    } else {
      const lines = daily.entries.map((e, i) =>
        `${i + 1}. ${e.entryTypeId} — ${e.points} pts${e.notes ? ` "${e.notes}"` : ""} (${e.id})`
      );
      await sendMessage(chatId, `📋 *${today}* (${daily.entries.length} entries)\n\`\`\`\n${lines.join("\n")}\n\`\`\``);
    }
    return;
  }

  // Handle confirm/cancel for pending operations
  if (pendingOps && pendingOps.chatId === chatId) {
    const lower = text.toLowerCase();
    if (lower === "ok" || lower === "confirm" || lower === "yes" || lower === "y" || lower === "✅") {
      const result = await executeOperations(pendingOps.operations);
      pendingOps = null;
      await sendMessage(chatId, result);
      return;
    }
    if (lower === "cancel" || lower === "no" || lower === "n" || lower === "❌") {
      pendingOps = null;
      await sendMessage(chatId, "❌ Cancelled.");
      return;
    }
    // Otherwise, treat as additional input — append to pending
  }

  // Parse natural language input
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await sendMessage(chatId, "⚠️ OPENAI_API_KEY not set.");
    return;
  }

  const llm = createOpenAIProvider(apiKey, "gpt-4o-mini");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });

  // Get existing entries for DELETE/UPDATE context
  const daily = await readDailyFile(today);
  const existingEntries = daily.entries.length > 0
    ? daily.entries.map((e) => `  ${e.id}: ${e.entryTypeId} ${e.points}pts "${e.notes}"`).join("\n")
    : undefined;

  try {
    const result = await parseInput(text, llm, today, existingEntries);

    // Filter out NONE operations for display
    const actionOps = result.operations.filter((o) => o.kind !== "NONE");
    const noneOps = result.operations.filter((o) => o.kind === "NONE");

    if (actionOps.length === 0) {
      const reasons = noneOps.map((o) => (o as any).reason).join("; ");
      await sendMessage(chatId, `⚠️ No diary operations detected.\n${reasons || "Try again with specific activities."}`);
      return;
    }

    // Merge with existing pending ops if any
    if (pendingOps && pendingOps.chatId === chatId) {
      pendingOps.operations.push(...actionOps);
    } else {
      pendingOps = { chatId, operations: actionOps };
    }

    const display = formatOperations(pendingOps.operations);
    await sendMessage(
      chatId,
      `${display}\n\n✅ *Confirm* or ❌ *Cancel*?`,
      {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: "confirm" },
            { text: "❌ Cancel", callback_data: "cancel" },
          ],
        ],
      }
    );

    // Show NONE warnings if any
    if (noneOps.length > 0) {
      const warnings = noneOps.map((o) => `⚠️ ${(o as any).reason}`).join("\n");
      await sendMessage(chatId, warnings);
    }
  } catch (e) {
    await sendMessage(chatId, `⚠️ Parse error: ${e}`);
  }
}

// ---------------------------------------------------------------------------
// Callback Query Handler (inline buttons)
// ---------------------------------------------------------------------------

async function handleCallback(update: TelegramUpdate): Promise<void> {
  const cb = update.callback_query;
  if (!cb || cb.from.id !== ALLOWED_USER_ID) return;

  const chatId = cb.message.chat.id;

  if (cb.data === "confirm" && pendingOps && pendingOps.chatId === chatId) {
    const result = await executeOperations(pendingOps.operations);
    pendingOps = null;
    await answerCallback(cb.id, "Saved!");
    await sendMessage(chatId, result);
  } else if (cb.data === "cancel") {
    pendingOps = null;
    await answerCallback(cb.id, "Cancelled");
    await sendMessage(chatId, "❌ Cancelled.");
  } else {
    await answerCallback(cb.id);
  }
}

// ---------------------------------------------------------------------------
// Long Polling Loop
// ---------------------------------------------------------------------------

async function poll(): Promise<void> {
  let offset = 0;

  console.log("🦮 Diary Bot starting... (@diary_reborn_bot)");
  console.log(`   Allowed user: ${ALLOWED_USER_ID}`);
  console.log(`   Data dir: ${process.cwd()}/data`);

  // Set bot commands
  await tgApi("setMyCommands", {
    commands: [
      { command: "status", description: "Show full dashboard (all data)" },
      { command: "today", description: "Show today's entries" },
      { command: "start", description: "Start the bot" },
    ],
  });

  while (true) {
    try {
      const resp = await fetch(`${API_BASE}/getUpdates?offset=${offset}&timeout=30`);
      const data = await resp.json() as { ok: boolean; result: TelegramUpdate[] };

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update);
          }
          if (update.callback_query) {
            await handleCallback(update);
          }
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

poll().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
