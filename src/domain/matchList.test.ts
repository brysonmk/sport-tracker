import { describe, expect, it } from "vitest";
import { groupMatches, matchTime } from "./matchList";
import type { MatchStatus } from "./types";

const day = (n: number) => new Date(Date.UTC(2026, 9, n));

function m(id: string, status: MatchStatus, kickoffDay: number | null, createdDay = 1) {
  return { id, status, kickoffAt: kickoffDay ? day(kickoffDay) : null, startedAt: null, finishedAt: null, createdAt: day(createdDay) };
}

describe("matchTime", () => {
  it("prefers kickoff, then start, then creation", () => {
    expect(matchTime(m("a", "SCHEDULED", 5))).toEqual(day(5));
    expect(matchTime({ ...m("a", "LIVE", null), startedAt: day(7) })).toEqual(day(7));
    expect(matchTime(m("a", "SCHEDULED", null, 3))).toEqual(day(3));
  });
});

describe("groupMatches", () => {
  it("splits by status and sorts each list", () => {
    const { live, upcoming, results } = groupMatches([
      m("r-old", "FINISHED", 1),
      m("u-late", "SCHEDULED", 20),
      m("l", "LIVE", 10),
      m("r-new", "FINISHED", 8),
      m("u-soon", "SCHEDULED", 12),
    ]);
    expect(live.map((x) => x.id)).toEqual(["l"]);
    expect(upcoming.map((x) => x.id)).toEqual(["u-soon", "u-late"]);
    expect(results.map((x) => x.id)).toEqual(["r-new", "r-old"]);
  });

  it("returns empty lists for no matches", () => {
    expect(groupMatches([])).toEqual({ live: [], upcoming: [], results: [] });
  });
});
