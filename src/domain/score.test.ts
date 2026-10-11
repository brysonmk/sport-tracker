import { describe, expect, it } from "vitest";
import { outcomeFor, scoreOf } from "./score";

describe("scoreOf", () => {
  const base = { homeTeamId: "h", awayTeamId: "a" };

  it("is 0-0 with no goals", () => {
    expect(scoreOf({ ...base, goals: [] })).toEqual({ home: 0, away: 0 });
  });

  it("counts goals for each side", () => {
    const goals = [{ teamId: "h" }, { teamId: "a" }, { teamId: "h" }];
    expect(scoreOf({ ...base, goals })).toEqual({ home: 2, away: 1 });
  });

  it("ignores goals credited to a team not in the match", () => {
    expect(scoreOf({ ...base, goals: [{ teamId: "other" }] })).toEqual({ home: 0, away: 0 });
  });
});

describe("outcomeFor", () => {
  it.each([
    [2, 1, "W"],
    [1, 2, "L"],
    [0, 0, "D"],
    [3, 3, "D"],
  ] as const)("%i-%i is %s", (gf, ga, expected) => {
    expect(outcomeFor(gf, ga)).toBe(expected);
  });
});
