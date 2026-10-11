import { describe, expect, it } from "vitest";
import { formToObject, fromZodError, goalSchema, leagueNameSchema, matchSchema, playerSchema } from "./schemas";

describe("leagueNameSchema", () => {
  it("trims the name", () => {
    expect(leagueNameSchema.parse({ name: "  Sunday 5s " })).toEqual({ name: "Sunday 5s" });
  });

  it("rejects blank and too-long names with readable messages", () => {
    const blank = leagueNameSchema.safeParse({ name: "   " });
    expect(blank.success).toBe(false);
    expect(fromZodError(blank.error!).fieldErrors?.name).toEqual(["League name is required"]);

    const long = leagueNameSchema.safeParse({ name: "x".repeat(61) });
    expect(fromZodError(long.error!).fieldErrors?.name?.[0]).toMatch(/at most 60/);
  });

  it("rejects a missing name", () => {
    expect(leagueNameSchema.safeParse({}).success).toBe(false);
  });
});

describe("playerSchema", () => {
  it("turns an empty team into null (free agent)", () => {
    expect(playerSchema.parse({ name: "Ana", teamId: "" })).toEqual({ name: "Ana", teamId: null });
  });
});

describe("matchSchema", () => {
  it("accepts two different teams and no kickoff", () => {
    expect(matchSchema.parse({ homeTeamId: "a", awayTeamId: "b", kickoffAt: "" })).toEqual({
      homeTeamId: "a",
      awayTeamId: "b",
      kickoffAt: null,
    });
  });

  it("parses an ISO kickoff time", () => {
    const parsed = matchSchema.parse({ homeTeamId: "a", awayTeamId: "b", kickoffAt: "2026-10-11T18:30:00.000Z" });
    expect(parsed.kickoffAt?.toISOString()).toBe("2026-10-11T18:30:00.000Z");
  });

  it("rejects a team playing itself, on the away field", () => {
    const result = matchSchema.safeParse({ homeTeamId: "a", awayTeamId: "a" });
    expect(fromZodError(result.error!).fieldErrors?.awayTeamId).toEqual(["A team can't play itself"]);
  });

  it("rejects an invalid kickoff", () => {
    expect(matchSchema.safeParse({ homeTeamId: "a", awayTeamId: "b", kickoffAt: "not a date" }).success).toBe(false);
  });
});

describe("goalSchema", () => {
  it("accepts a goal with no scorer, assist or minute", () => {
    expect(goalSchema.parse({ teamId: "t", scorerId: "", assistId: "", minute: "" })).toEqual({
      teamId: "t",
      scorerId: null,
      assistId: null,
      minute: null,
    });
  });

  it("parses the minute as a number", () => {
    expect(goalSchema.parse({ teamId: "t", minute: "42" }).minute).toBe(42);
  });

  it.each(["-1", "4.5", "abc", "201"])("rejects minute %j", (minute) => {
    expect(goalSchema.safeParse({ teamId: "t", minute }).success).toBe(false);
  });

  it("rejects a player assisting their own goal", () => {
    const result = goalSchema.safeParse({ teamId: "t", scorerId: "p", assistId: "p" });
    expect(fromZodError(result.error!).fieldErrors?.assistId).toEqual(["A player can't assist their own goal"]);
  });
});

describe("formToObject", () => {
  it("keeps string fields and drops files", () => {
    const form = new FormData();
    form.set("name", "Ana");
    form.set("file", new Blob(["x"]));
    expect(formToObject(form)).toEqual({ name: "Ana" });
  });
});
