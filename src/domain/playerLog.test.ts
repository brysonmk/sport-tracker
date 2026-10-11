import { describe, expect, it } from "vitest";
import { playerLog } from "./playerLog";
import type { MatchStatus } from "./types";

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 23));

function match(
  id: string,
  dayOfMonth: number,
  goals: { teamId: string; scorerId?: string; assistId?: string }[],
  status: MatchStatus = "FINISHED",
) {
  return {
    id,
    status,
    homeTeamId: "a",
    awayTeamId: "b",
    home: { name: "Aces" },
    away: { name: "Bears" },
    kickoffAt: day(dayOfMonth),
    startedAt: null,
    finishedAt: null,
    createdAt: day(1),
    goals: goals.map((g) => ({ teamId: g.teamId, scorerId: g.scorerId ?? null, assistId: g.assistId ?? null })),
  };
}

describe("playerLog", () => {
  it("is empty for a player with no goals or assists", () => {
    expect(playerLog("p", [match("m1", 2, [{ teamId: "a", scorerId: "q" }])])).toEqual([]);
  });

  it("lists matches oldest first with goals, assists, result and running totals", () => {
    const log = playerLog("p", [
      match("later", 9, [{ teamId: "b", scorerId: "x" }, { teamId: "a", assistId: "p", scorerId: "q" }]),
      match("earlier", 2, [{ teamId: "a", scorerId: "p" }, { teamId: "a", scorerId: "p" }, { teamId: "b" }]),
    ]);

    expect(log.map((e) => e.matchId)).toEqual(["earlier", "later"]);
    expect(log[0]).toMatchObject({ label: "Aces 2–1 Bears", goals: 2, assists: 0, outcome: "W", totalGoals: 2, totalAssists: 0 });
    expect(log[1]).toMatchObject({ label: "Aces 1–1 Bears", goals: 0, assists: 1, outcome: "D", totalGoals: 2, totalAssists: 1 });
  });

  it("gives the result from the away side's point of view for an away player", () => {
    const log = playerLog("p", [match("m", 2, [{ teamId: "b", scorerId: "p" }, { teamId: "a" }, { teamId: "a" }])]);
    expect(log[0].outcome).toBe("L");
  });

  it("ignores scheduled and live matches", () => {
    const log = playerLog("p", [match("m", 2, [{ teamId: "a", scorerId: "p" }], "LIVE")]);
    expect(log).toEqual([]);
  });

  it("does not count an assist on the player's own goal", () => {
    const log = playerLog("p", [match("m", 2, [{ teamId: "a", scorerId: "p", assistId: "p" }])]);
    expect(log[0]).toMatchObject({ goals: 1, assists: 0 });
  });
});
