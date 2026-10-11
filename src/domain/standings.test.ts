import { describe, expect, it } from "vitest";
import { computeStandings } from "./standings";
import type { MatchInput, MatchStatus, TeamInput } from "./types";

const teams: TeamInput[] = [
  { id: "a", name: "Aces" },
  { id: "b", name: "Bears" },
  { id: "c", name: "Comets" },
  { id: "d", name: "Dragons" },
];

let nextId = 0;
/** Builds a match with `homeGoals` goals for home and `awayGoals` for away. */
function match(home: string, away: string, homeGoals: number, awayGoals: number, status: MatchStatus = "FINISHED"): MatchInput {
  const goal = (teamId: string) => ({ teamId, scorerId: null, assistId: null });
  return {
    id: `m${nextId++}`,
    homeTeamId: home,
    awayTeamId: away,
    status,
    goals: [...Array(homeGoals).fill(home).map(goal), ...Array(awayGoals).fill(away).map(goal)],
  };
}

/** Team ids in table order, e.g. "b c a d". */
function order(rows: ReturnType<typeof computeStandings>) {
  return rows.map((r) => r.teamId).join(" ");
}

describe("computeStandings", () => {
  it("lists every team with zeros before any match, sharing first place, alphabetically", () => {
    const rows = computeStandings(teams, []);
    expect(order(rows)).toBe("a b c d");
    expect(rows.map((r) => r.position)).toEqual([1, 1, 1, 1]);
    expect(rows[0]).toMatchObject({ played: 0, points: 0, goalDifference: 0 });
  });

  it("counts a win, a draw and a loss", () => {
    const rows = computeStandings(teams, [match("a", "b", 2, 0), match("c", "d", 1, 1)]);
    const byId = Object.fromEntries(rows.map((r) => [r.teamId, r]));

    expect(byId.a).toMatchObject({ played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3 });
    expect(byId.b).toMatchObject({ played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0 });
    expect(byId.c).toMatchObject({ played: 1, drawn: 1, points: 1, goalDifference: 0 });
    expect(byId.d).toMatchObject({ played: 1, drawn: 1, points: 1, goalDifference: 0 });
  });

  it("ignores scheduled and live matches", () => {
    const rows = computeStandings(teams, [match("a", "b", 3, 0, "LIVE"), match("c", "d", 0, 0, "SCHEDULED")]);
    expect(rows.every((r) => r.played === 0)).toBe(true);
  });

  it("ranks by points first", () => {
    // b: win + draw = 4 pts; a: win = 3 pts even with a bigger goal difference
    const rows = computeStandings(teams, [match("a", "c", 5, 0), match("b", "d", 1, 0), match("b", "c", 0, 0)]);
    expect(order(rows).startsWith("b a")).toBe(true);
  });

  it("breaks a points tie on goal difference", () => {
    const rows = computeStandings(teams, [match("a", "c", 1, 0), match("b", "d", 3, 0)]);
    expect(order(rows).startsWith("b a")).toBe(true);
    expect(rows[0].position).toBe(1);
    expect(rows[1].position).toBe(2);
  });

  it("breaks a goal-difference tie on goals scored", () => {
    // a: 3-2 (GD +1, GF 3); b: 1-0 (GD +1, GF 1)
    const rows = computeStandings(teams, [match("a", "c", 3, 2), match("b", "d", 1, 0)]);
    expect(order(rows).startsWith("a b")).toBe(true);
  });

  it("breaks a full tie on head-to-head", () => {
    // a and b both end on 3 pts, GD 0, GF 2. b beat a head-to-head, so b is above a.
    const rows = computeStandings(teams, [
      match("b", "a", 1, 0), // b wins the head-to-head
      match("a", "c", 2, 1),
      match("b", "d", 1, 2),
    ]);
    const a = rows.find((r) => r.teamId === "a")!;
    const b = rows.find((r) => r.teamId === "b")!;
    expect([a.points, a.goalDifference, a.goalsFor]).toEqual([b.points, b.goalDifference, b.goalsFor]);
    expect(b.position).toBeLessThan(a.position);
  });

  it("uses only matches between the tied teams for head-to-head", () => {
    // a, b, c all on 3 pts, GD 0, GF 1 in a 3-way cycle (a>b, b>c, c>a, all 1-0):
    // head-to-head can't split them, so they share 1st, listed alphabetically.
    const rows = computeStandings(teams.slice(0, 3), [match("a", "b", 1, 0), match("b", "c", 1, 0), match("c", "a", 1, 0)]);
    expect(order(rows)).toBe("a b c");
    expect(rows.map((r) => r.position)).toEqual([1, 1, 1]);
  });

  it("gives the next distinct team the position after a shared one (1, 1, 3)", () => {
    const rows = computeStandings(teams.slice(0, 3), [match("a", "c", 1, 0), match("b", "c", 1, 0)]);
    expect(order(rows)).toBe("a b c");
    expect(rows.map((r) => r.position)).toEqual([1, 1, 3]);
  });

  it("ignores goals and matches for teams that are not in the table", () => {
    const rows = computeStandings(teams.slice(0, 2), [match("a", "zzz", 4, 0)]);
    expect(rows.find((r) => r.teamId === "a")).toMatchObject({ played: 1, points: 3 });
    expect(rows).toHaveLength(2);
  });
});
