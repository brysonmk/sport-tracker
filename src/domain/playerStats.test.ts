import { describe, expect, it } from "vitest";
import { computePlayerStats } from "./playerStats";
import type { GoalInput, MatchInput, MatchStatus, PlayerInput } from "./types";

const players: PlayerInput[] = [
  { id: "p1", name: "Ana", teamName: "Aces" },
  { id: "p2", name: "Ben", teamName: "Aces" },
  { id: "p3", name: "Cal", teamName: "Bears" },
];

function goal(scorerId: string | null, assistId: string | null = null): GoalInput {
  return { teamId: "a", scorerId, assistId };
}

function match(goals: GoalInput[], status: MatchStatus = "FINISHED"): MatchInput {
  return { id: "m", homeTeamId: "a", awayTeamId: "b", status, goals };
}

describe("computePlayerStats", () => {
  it("lists every player with zeros when nothing has been played", () => {
    const rows = computePlayerStats(players, []);
    expect(rows.map((r) => r.playerName)).toEqual(["Ana", "Ben", "Cal"]);
    expect(rows.every((r) => r.goals === 0 && r.assists === 0 && r.contributions === 0)).toBe(true);
  });

  it("counts goals and assists across matches", () => {
    const rows = computePlayerStats(players, [
      match([goal("p2", "p1"), goal("p2")]),
      match([goal("p3", "p2")]),
    ]);
    const byId = Object.fromEntries(rows.map((r) => [r.playerId, r]));
    expect(byId.p1).toMatchObject({ goals: 0, assists: 1, contributions: 1 });
    expect(byId.p2).toMatchObject({ goals: 2, assists: 1, contributions: 3 });
    expect(byId.p3).toMatchObject({ goals: 1, assists: 0, contributions: 1 });
  });

  it("ignores goals with no scorer (own goals / unknown) for player stats", () => {
    const rows = computePlayerStats(players, [match([goal(null, "p1")])]);
    expect(rows.find((r) => r.playerId === "p1")).toMatchObject({ goals: 0, assists: 1 });
  });

  it("does not count a player assisting their own goal", () => {
    const rows = computePlayerStats(players, [match([goal("p1", "p1")])]);
    expect(rows.find((r) => r.playerId === "p1")).toMatchObject({ goals: 1, assists: 0 });
  });

  it("ignores scheduled and live matches", () => {
    const rows = computePlayerStats(players, [match([goal("p1")], "LIVE"), match([goal("p1")], "SCHEDULED")]);
    expect(rows.find((r) => r.playerId === "p1")!.goals).toBe(0);
  });

  it("ignores players who are not in the list (e.g. deleted)", () => {
    const rows = computePlayerStats(players, [match([goal("ghost", "ghost2")])]);
    expect(rows).toHaveLength(3);
  });

  it("sorts by goals, then assists, then name", () => {
    const rows = computePlayerStats(players, [
      match([goal("p3"), goal("p2", "p1"), goal("p1")]),
    ]);
    // p1 (1G 1A), then p2 and p3 (1G 0A) alphabetically
    expect(rows.map((r) => r.playerName)).toEqual(["Ana", "Ben", "Cal"]);
  });
});
