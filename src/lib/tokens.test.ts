import { describe, expect, it } from "vitest";
import { generateAdminToken, generateSlug, hashAdminToken, slugify } from "./tokens";

describe("generateAdminToken", () => {
  it("returns a 32-character URL-safe token", () => {
    const token = generateAdminToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it("returns a different token each time", () => {
    expect(generateAdminToken()).not.toBe(generateAdminToken());
  });
});

describe("hashAdminToken", () => {
  it("is deterministic and hex-encoded SHA-256", () => {
    const hash = hashAdminToken("abc");
    expect(hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashAdminToken("abc")).toBe(hash);
  });
});

describe("slugify", () => {
  it.each([
    ["Tuesday Night 5s", "tuesday-night-5s"],
    ["  Café   United!! ", "cafe-united"],
    ["---", ""],
    ["a".repeat(60), "a".repeat(40)],
  ])("slugify(%j) -> %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("never ends with a dash after truncation", () => {
    expect(slugify(`${"a".repeat(39)} b`)).toBe("a".repeat(39));
  });
});

describe("generateSlug", () => {
  it("appends a 4-character suffix to the slugified name", () => {
    expect(generateSlug("Sunday League")).toMatch(/^sunday-league-[a-z2-9]{4}$/);
  });

  it("falls back to 'league' when the name has no usable characters", () => {
    expect(generateSlug("!!!")).toMatch(/^league-[a-z2-9]{4}$/);
  });
});
