import { describe, it, expect } from "vitest";
import { computeStreaks } from "../src/core/streaks.js";
import type { DailyFile } from "../src/schema/types.js";

function makeDay(date: string, types: string[]): DailyFile {
  return {
    date,
    entries: types.map((t) => ({
      id: `${t}-${date}-1`,
      date,
      entryTypeId: t,
      points: 1,
      notes: "",
      createdAt: 0,
      updatedAt: 0,
    })),
  };
}

describe("computeStreaks", () => {
  it("returns empty map for no data", () => {
    const result = computeStreaks([], "2026-02-11");
    expect(result.size).toBe(0);
  });

  it("computes single-day streak", () => {
    const days = [makeDay("2026-02-11", ["gym"])];
    const result = computeStreaks(days, "2026-02-11");

    const gym = result.get("gym")!;
    expect(gym.currentStreak).toBe(1);
    expect(gym.longestStreak).toBe(1);
    expect(gym.isActiveToday).toBe(true);
  });

  it("computes multi-day streak", () => {
    const days = [
      makeDay("2026-02-09", ["gym"]),
      makeDay("2026-02-10", ["gym"]),
      makeDay("2026-02-11", ["gym"]),
    ];
    const result = computeStreaks(days, "2026-02-11");

    const gym = result.get("gym")!;
    expect(gym.currentStreak).toBe(3);
    expect(gym.longestStreak).toBe(3);
    expect(gym.isActiveToday).toBe(true);
  });

  it("detects broken streak", () => {
    const days = [
      makeDay("2026-02-08", ["gym"]),
      makeDay("2026-02-09", ["gym"]),
      // 2026-02-10 missing
      makeDay("2026-02-11", ["gym"]),
    ];
    const result = computeStreaks(days, "2026-02-11");

    const gym = result.get("gym")!;
    expect(gym.currentStreak).toBe(1); // Only today
    expect(gym.longestStreak).toBe(2); // Feb 8-9
    expect(gym.isActiveToday).toBe(true);
  });

  it("shows zero current streak if not logged today", () => {
    const days = [
      makeDay("2026-02-09", ["gym"]),
      makeDay("2026-02-10", ["gym"]),
    ];
    const result = computeStreaks(days, "2026-02-11");

    const gym = result.get("gym")!;
    expect(gym.currentStreak).toBe(0);
    expect(gym.longestStreak).toBe(2);
    expect(gym.isActiveToday).toBe(false);
  });

  it("handles multiple entry types independently", () => {
    const days = [
      makeDay("2026-02-10", ["gym", "brushteeth"]),
      makeDay("2026-02-11", ["brushteeth"]),
    ];
    const result = computeStreaks(days, "2026-02-11");

    expect(result.get("gym")!.currentStreak).toBe(0);
    expect(result.get("brushteeth")!.currentStreak).toBe(2);
  });
});
