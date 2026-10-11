import { describe, expect, it } from "vitest";
import { goalsCsvRows, matchesCsvRows } from "./exports";

const match = {
  status: "FINISHED" as const,
  kickoffAt: new Date("2026-10-11T23:00:00Z"),
  startedAt: null,
  home: { name: "Lions" },
  away: { name: "Tigers" },
  score: { home: 2, away: 1 },
  goals: [
    { side: "home" as const, minute: 12, scorer: { name: "Leo" }, assist: { name: "Lara" } },
    { side: "away" as const, minute: null, scorer: null, assist: null },
  ],
};

describe("matchesCsvRows", () => {
  it("writes one row per match with the score", () => {
    expect(matchesCsvRows([match])[1]).toEqual(["2026-10-11T23:00:00.000Z", "Finished", "Lions", 2, 1, "Tigers"]);
  });

  it("leaves the score empty for a scheduled match", () => {
    const row = matchesCsvRows([{ ...match, status: "SCHEDULED", score: { home: 0, away: 0 } }])[1];
    expect(row.slice(3, 5)).toEqual([null, null]);
  });
});

describe("goalsCsvRows", () => {
  it("writes one row per goal, naming the team and unknown scorers", () => {
    expect(goalsCsvRows([match]).slice(1)).toEqual([
      ["2026-10-11T23:00:00.000Z", "Lions vs Tigers", 12, "Lions", "Leo", "Lara"],
      ["2026-10-11T23:00:00.000Z", "Lions vs Tigers", null, "Tigers", "Own goal / unknown", null],
    ]);
  });
});
