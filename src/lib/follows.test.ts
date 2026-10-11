import { describe, expect, it } from "vitest";
import { forgetLeague, MAX_LEAGUES, parseFollows, rememberLeague, toggleFollowPlayer, type Follows } from "./follows";

const empty: Follows = { leagues: [], players: [] };

describe("rememberLeague", () => {
  it("puts the most recent league first without duplicates", () => {
    let f = rememberLeague(empty, { slug: "a", name: "A" });
    f = rememberLeague(f, { slug: "b", name: "B" });
    f = rememberLeague(f, { slug: "a", name: "A renamed" });
    expect(f.leagues).toEqual([{ slug: "a", name: "A renamed" }, { slug: "b", name: "B" }]);
  });

  it("keeps a known admin token when the league is later visited through its public link", () => {
    let f = rememberLeague(empty, { slug: "a", name: "A", adminToken: "t" });
    f = rememberLeague(f, { slug: "a", name: "A" });
    expect(f.leagues[0].adminToken).toBe("t");
  });

  it(`keeps at most ${MAX_LEAGUES} leagues`, () => {
    let f = empty;
    for (let i = 0; i < MAX_LEAGUES + 3; i++) f = rememberLeague(f, { slug: `l${i}`, name: `L${i}` });
    expect(f.leagues).toHaveLength(MAX_LEAGUES);
    expect(f.leagues[0].slug).toBe(`l${MAX_LEAGUES + 2}`);
  });
});

describe("toggleFollowPlayer", () => {
  it("follows, then unfollows", () => {
    const player = { slug: "a", playerId: "p", name: "Ana" };
    const followed = toggleFollowPlayer(empty, player);
    expect(followed.players).toEqual([player]);
    expect(toggleFollowPlayer(followed, player).players).toEqual([]);
  });
});

describe("forgetLeague", () => {
  it("removes the league and the players followed in it", () => {
    const f: Follows = {
      leagues: [{ slug: "a", name: "A" }, { slug: "b", name: "B" }],
      players: [{ slug: "a", playerId: "p", name: "Ana" }, { slug: "b", playerId: "q", name: "Ben" }],
    };
    expect(forgetLeague(f, "a")).toEqual({ leagues: [{ slug: "b", name: "B" }], players: [{ slug: "b", playerId: "q", name: "Ben" }] });
  });
});

describe("parseFollows", () => {
  it.each([null, "", "not json", "42", '{"leagues":"x"}'])("returns empty for %j", (raw) => {
    expect(parseFollows(raw)).toEqual(empty);
  });

  it("drops malformed entries", () => {
    const raw = JSON.stringify({ leagues: [{ slug: "a", name: "A" }, { slug: 1 }, null], players: [{ slug: "a" }] });
    expect(parseFollows(raw)).toEqual({ leagues: [{ slug: "a", name: "A" }], players: [] });
  });
});
