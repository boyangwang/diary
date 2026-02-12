/**
 * NL Parser test suite.
 *
 * Tests the LLM-based natural language → primitive operations parsing.
 * These tests hit the real OpenAI API (gpt-4o-mini).
 * Run with: OPENAI_API_KEY=... npx vitest run tests/parse.test.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import { parseInput, createOpenAIProvider, type LLMProvider, type PrimitiveOperation } from "../src/parser/parse.js";

// Skip if no API key
const apiKey = process.env.OPENAI_API_KEY;
const describeIf = apiKey ? describe : describe.skip;

let llm: LLMProvider;

describeIf("parseInput — NL to Primitive Operations", () => {
  beforeAll(() => {
    llm = createOpenAIProvider(apiKey!, "gpt-4o-mini");
  });

  const TODAY = "2026-02-12";
  const YESTERDAY = "2026-02-11";

  // TC-01: Simple add, multiple activities
  it("TC-01: parses multiple activities in one message", async () => {
    const result = await parseInput("gym 1hr, brushed teeth, skipped lunch", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(3);
    expect(ops.some((o) => o.kind === "ADD" && o.entryTypeId === "gym" && o.points === 1.5)).toBe(true);
    expect(ops.some((o) => o.kind === "ADD" && o.entryTypeId === "brushteeth")).toBe(true);
    expect(ops.some((o) => o.kind === "ADD" && o.entryTypeId === "eatless")).toBe(true);
  }, 15000);

  // TC-02: Single activity, no params
  it("TC-02: parses single non-parameterized activity", async () => {
    const result = await parseInput("brushed teeth", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(1);
    expect(ops[0]).toMatchObject({ kind: "ADD", date: TODAY, entryTypeId: "brushteeth", points: 1 });
  }, 15000);

  // TC-03: Parameterized with explicit duration
  it("TC-03: parses parameterized activity with duration and notes", async () => {
    const result = await parseInput("worked for 3 hours on investor deck", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(1);
    expect(ops[0]).toMatchObject({ kind: "ADD", date: TODAY, entryTypeId: "work" });
    expect((ops[0] as any).points).toBe(3);
    expect((ops[0] as any).notes).toContain("investor deck");
  }, 15000);

  // TC-04: Yesterday reference
  it("TC-04: handles 'yesterday' date reference", async () => {
    const result = await parseInput("yesterday I went to gym for 2 hours and took a shower", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(2);
    for (const op of ops) {
      expect((op as any).date).toBe(YESTERDAY);
    }
    expect(ops.some((o) => (o as any).entryTypeId === "gym" && (o as any).points === 3)).toBe(true);
    expect(ops.some((o) => (o as any).entryTypeId === "shower")).toBe(true);
  }, 15000);

  // TC-05: Chinese input
  it("TC-05: parses Chinese input", async () => {
    const result = await parseInput("今天冥想了30分钟，洗了鼻子", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(2);
    expect(ops.some((o) => (o as any).entryTypeId === "meditation")).toBe(true);
    expect(ops.some((o) => (o as any).entryTypeId === "sinusrinse")).toBe(true);
  }, 15000);

  // TC-06: Conversational tone
  it("TC-06: parses conversational input", async () => {
    const result = await parseInput("didn't eat dinner tonight, also took my vitamins", llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(2);
    expect(ops.some((o) => (o as any).entryTypeId === "nosupper")).toBe(true);
    expect(ops.some((o) => (o as any).entryTypeId === "vitamin")).toBe(true);
  }, 15000);

  // TC-07: Delete request (needs existing entries context)
  it("TC-07: parses delete request", async () => {
    const existingEntries = '  gym-2026-02-12T10:00:00.000Z-42: gym 1.5pts ""';
    const result = await parseInput("actually remove the gym entry from today", llm, TODAY, existingEntries);
    const ops = result.operations.filter((o) => o.kind === "DELETE");

    expect(ops.length).toBe(1);
    expect((ops[0] as any).entryId).toContain("gym");
  }, 15000);

  // TC-08: Update request
  it("TC-08: parses update request", async () => {
    const existingEntries = '  gym-2026-02-12T10:00:00.000Z-42: gym 1.5pts ""';
    const result = await parseInput("change today's gym to 2 hours instead", llm, TODAY, existingEntries);
    const ops = result.operations.filter((o) => o.kind === "UPDATE");

    expect(ops.length).toBe(1);
    expect((ops[0] as any).field).toBe("points");
    expect((ops[0] as any).value).toBe(3);
  }, 15000);

  // TC-09: Mixed languages with notes
  it("TC-09: parses mixed language input with notes", async () => {
    const result = await parseInput('badminton 1.5hrs with coach, read 查拉图斯特拉 for 30min', llm, TODAY);
    const ops = result.operations.filter((o) => o.kind === "ADD");

    expect(ops.length).toBe(2);
    expect(ops.some((o) => (o as any).entryTypeId === "badminton")).toBe(true);
    expect(ops.some((o) => (o as any).entryTypeId === "read")).toBe(true);
  }, 15000);

  // TC-10: Dangerous input (safety test)
  it("TC-10: does NOT create destructive operations from frustration", async () => {
    const result = await parseInput("I didn't do anything today, wasted the whole day", llm, TODAY);
    const actionOps = result.operations.filter((o) => o.kind !== "NONE");

    expect(actionOps.length).toBe(0);
    expect(result.operations.some((o) => o.kind === "NONE")).toBe(true);
  }, 15000);
});
