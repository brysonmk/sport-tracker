import { describe, expect, it } from "vitest";
import { goalsAndAssistsSeries, integerTicks, valueAt } from "./chartSeries";
import type { PlayerLogEntry } from "./playerLog";

describe("valueAt", () => {
  const points = [
    { t: 10, value: 1 },
    { t: 20, value: 3 },
  ];
  it.each([
    [5, 0],
    [10, 1],
    [15, 1],
    [20, 3],
    [99, 3],
  ])("at t=%i the running total is %i", (t, expected) => {
    expect(valueAt(points, t)).toBe(expected);
  });

  it("is 0 for an empty series", () => {
    expect(valueAt([], 50)).toBe(0);
  });
});

describe("integerTicks", () => {
  it.each([
    [0, [0, 1]],
    [1, [0, 1]],
    [3, [0, 1, 2, 3]],
    [4, [0, 1, 2, 3, 4]],
    [5, [0, 2, 4, 6]],
    [9, [0, 5, 10]],
    [17, [0, 5, 10, 15, 20]],
  ])("max %i -> %j", (max, expected) => {
    expect(integerTicks(max)).toEqual(expected);
  });
});

describe("goalsAndAssistsSeries", () => {
  const entry = (day: number, goals: number, assists: number, totalGoals: number, totalAssists: number): PlayerLogEntry => ({
    matchId: `m${day}`,
    date: new Date(day),
    label: "",
    goals,
    assists,
    outcome: "W",
    totalGoals,
    totalAssists,
  });

  it("adds a point only where that stat changed", () => {
    const series = goalsAndAssistsSeries([entry(1, 2, 0, 2, 0), entry(2, 0, 1, 2, 1), entry(3, 1, 1, 3, 2)]);
    expect(series.goals).toEqual([{ t: 1, value: 2 }, { t: 3, value: 3 }]);
    expect(series.assists).toEqual([{ t: 2, value: 1 }, { t: 3, value: 2 }]);
  });
});
