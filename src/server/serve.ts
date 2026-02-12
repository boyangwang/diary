/**
 * Minimal HTTP server for the Diary dashboard.
 *
 * Serves the rendered dashboard as HTML.
 * Designed to run behind Tailscale Funnel at tracker.deardiary.network.
 *
 * Routes:
 *   GET /           → HTML dashboard
 *   GET /api/today  → JSON today's data
 *   GET /api/week   → JSON this week's data
 *   GET /api/health → Health check
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readDailyFile, listDailyDates, readEntryTypes } from "../core/store.js";
import { computeDailySummary, computeWeekSummary, buildDomainLookup } from "../core/points.js";
import { computeStreaks } from "../core/streaks.js";
import { renderDashboard } from "../render/json-to-md.js";
import type { DailyFile, DailySummary } from "../schema/types.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.DIARY_PORT ?? "3456", 10);

// ---------------------------------------------------------------------------
// Date Helpers
// ---------------------------------------------------------------------------

function todaySGT(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
}

function getWeekBounds(dateStr: string): { weekStart: string; weekEnd: string } {
  const d = new Date(dateStr + "T00:00:00+08:00");
  const day = d.getDay(); // 0=Sun, 1=Mon...
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
// Markdown → HTML (simple wrapper)
// ---------------------------------------------------------------------------

function markdownToHtml(md: string): string {
  // Minimal Markdown → HTML conversion (no external dependencies)
  let html = md;

  // Headers
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Tables
  const lines = html.split("\n");
  const result: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("|") && line.endsWith("|")) {
      // Check if next line is separator
      if (!inTable) {
        result.push("<table>");
        inTable = true;
      }
      // Skip separator line (|---|---|)
      if (/^\|[-\s|]+\|$/.test(line)) continue;

      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      const isHeader = i + 1 < lines.length && /^\|[-\s|]+\|$/.test(lines[i + 1]);
      const tag = isHeader ? "th" : "td";
      const row = cells.map((c) => `<${tag}>${c}</${tag}>`).join("");
      result.push(`<tr>${row}</tr>`);
    } else {
      if (inTable) {
        result.push("</table>");
        inTable = false;
      }
      // Wrap non-empty, non-tag lines in <p>
      if (line.trim() && !line.startsWith("<")) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  if (inTable) result.push("</table>");

  return result.join("\n");
}

function wrapHtml(body: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root { --bg: #0d1117; --fg: #c9d1d9; --border: #30363d; --accent: #58a6ff; --green: #3fb950; --warn: #d29922; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
           background: var(--bg); color: var(--fg); padding: 2rem; max-width: 900px; margin: 0 auto; line-height: 1.6; }
    h1 { color: var(--accent); margin-bottom: 0.5rem; font-size: 1.8rem; }
    h2 { color: var(--green); margin-top: 2rem; margin-bottom: 0.8rem; font-size: 1.3rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
    h3 { color: var(--warn); margin-top: 1rem; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.5rem 0.8rem; text-align: left; border: 1px solid var(--border); }
    th { background: #161b22; color: var(--accent); font-weight: 600; }
    tr:nth-child(even) { background: #161b22; }
    blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: #8b949e; margin: 0.5rem 0; }
    strong { color: #f0f6fc; }
    hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
    p { margin: 0.4rem 0; }
    @media (max-width: 600px) { body { padding: 1rem; } table { font-size: 0.85rem; } }
  </style>
  <meta http-equiv="refresh" content="60">
</head>
<body>
${body}
<footer style="margin-top:2rem;color:#484f58;font-size:0.8rem;text-align:center">
  Diary — Life's Order · Auto-refreshes every 60s
</footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Request Handlers
// ---------------------------------------------------------------------------

async function handleDashboard(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const today = todaySGT();
    const { weekStart, weekEnd } = getWeekBounds(today);
    const weekDates = dateRange(weekStart, weekEnd);

    // Load data
    const { entryTypes } = await readEntryTypes();
    const domainLookup = buildDomainLookup(entryTypes);

    // Today's data
    const todayDaily = await readDailyFile(today);
    const todaySummary = computeDailySummary(todayDaily, domainLookup);

    // Week data
    const weekDailySummaries: DailySummary[] = [];
    for (const date of weekDates) {
      const daily = await readDailyFile(date);
      weekDailySummaries.push(computeDailySummary(daily, domainLookup));
    }
    const weekSummary = computeWeekSummary(weekDailySummaries, weekStart, weekEnd);

    // Streaks (load all daily files)
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
    last30Days.reverse(); // newest first

    // Render
    const md = renderDashboard({ today, todaySummary, weekSummary, streaks, entryTypes, last30Days });
    const html = wrapHtml(markdownToHtml(md), "Diary — Life Dashboard");

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Error: ${err}`);
  }
}

async function handleApiToday(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  const today = todaySGT();
  const daily = await readDailyFile(today);
  const { entryTypes } = await readEntryTypes();
  const domainLookup = buildDomainLookup(entryTypes);
  const summary = computeDailySummary(daily, domainLookup);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(summary, null, 2));
}

async function handleApiHealth(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  const dates = await listDailyDates();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", today: todaySGT(), daysTracked: dates.length }));
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  try {
    if (path === "/" || path === "/dashboard") {
      await handleDashboard(req, res);
    } else if (path === "/api/today") {
      await handleApiToday(req, res);
    } else if (path === "/api/health") {
      await handleApiHealth(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  } catch (err) {
    console.error(`Error handling ${path}:`, err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal server error");
  }
});

server.listen(PORT, () => {
  console.log(`🦮 Diary dashboard server running on http://localhost:${PORT}`);
  console.log(`   Today: ${todaySGT()}`);
});
