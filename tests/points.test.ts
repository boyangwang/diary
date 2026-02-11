import { describe, it, expect } from "vitest";
import { computeDailySummary, buildDomainLookup } from "../src/core/points.js";
import type { DailyFile, EntryType, HaradaDomain } from "../src/schema/types.js";

function makeEntryType(
  id: string,
  domain: HaradaDomain
): EntryType {
  return {
    id,
    title: id,
    defaultPoints: 1,
    pointStep: 0.5,
    routine: "Adhoc",
    domain,
    themeColors: ["000000", "FFFFFF"],
    createdAt: 0,
    updatedAt: 0,
  };
}

describe("computeDailySummary", () => {
  const entryTypes = [
    makeEntryType("gym", "physical"),
    makeEntryType("brushteeth", "medical"),
    makeEntryType("meditation", "mental"),
  ];
  const domainLookup = buildDomainLookup(entryTypes);

  it("returns zero summary for empty day", () => {
    const daily: DailyFile = { date: "2026-02-11", entries: [] };
    const result = computeDailySummary(daily, domainLookup);

    expect(result.totalPoints).toBe(0);
    expect(result.entryCount).toBe(0);
  });

  it("sums points correctly", () => {
    const daily: DailyFile = {
      date: "2026-02-11",
      entries: [
        { id: "1", date: "2026-02-11", entryTypeId: "gym", points: 1.5, notes: "", createdAt: 0, updatedAt: 0 },
        { id: "2", date: "2026-02-11", entryTypeId: "brushteeth", points: 1, notes: "", createdAt: 0, updatedAt: 0 },
        { id: "3", date: "2026-02-11", entryTypeId: "meditation", points: 1, notes: "", createdAt: 0, updatedAt: 0 },
      ],
    };
    const result = computeDailySummary(daily, domainLookup);

    expect(result.totalPoints).toBe(3.5);
    expect(result.entryCount).toBe(3);
    expect(result.pointsByDomain.physical).toBe(1.5);
    expect(result.pointsByDomain.medical).toBe(1);
    expect(result.pointsByDomain.mental).toBe(1);
    expect(result.pointsByType.gym).toBe(1.5);
  });
});
