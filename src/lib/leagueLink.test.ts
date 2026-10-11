import { describe, expect, it } from "vitest";
import { parseLeagueLink } from "./leagueLink";

const token = "ARcEjtx5fxKS6xWrkMsDLIbI6MqpFd7S";

describe("parseLeagueLink", () => {
  it.each([
    [`https://sports.example/a/${token}`, `/a/${token}`],
    [`http://localhost:3000/a/${token}/teams`, `/a/${token}`],
    [`/a/${token}?created=1`, `/a/${token}`],
    [`  a/${token}  `, `/a/${token}`],
    ["https://sports.example/l/sunday-5s-k3x9", "/l/sunday-5s-k3x9"],
    ["sports.example/l/sunday-5s-k3x9/players", "/l/sunday-5s-k3x9"],
    ["/l/demo-league#table", "/l/demo-league"],
  ])("%j -> %j", (input, expected) => {
    expect(parseLeagueLink(input)).toBe(expected);
  });

  it.each(["", "hello", "https://sports.example/", "/a/too-short", "/x/l"])("rejects %j", (input) => {
    expect(parseLeagueLink(input)).toBeNull();
  });
});
