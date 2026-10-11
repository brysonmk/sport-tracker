import { describe, expect, it } from "vitest";
import { canChangeStatus, statusChange } from "./matchStatus";

const now = new Date("2026-10-11T18:00:00Z");
const earlier = new Date("2026-10-11T17:00:00Z");

describe("canChangeStatus", () => {
  it.each([
    ["SCHEDULED", "LIVE", true],
    ["SCHEDULED", "FINISHED", true],
    ["LIVE", "FINISHED", true],
    ["LIVE", "SCHEDULED", true],
    ["FINISHED", "LIVE", true],
    ["FINISHED", "SCHEDULED", false],
    ["LIVE", "LIVE", false],
  ] as const)("%s -> %s is %s", (from, to, expected) => {
    expect(canChangeStatus(from, to)).toBe(expected);
  });
});

describe("statusChange", () => {
  it("starting a match records the start time", () => {
    expect(statusChange({ status: "SCHEDULED", startedAt: null }, "LIVE", now)).toEqual({
      status: "LIVE",
      startedAt: now,
      finishedAt: null,
    });
  });

  it("finishing records the finish time", () => {
    expect(statusChange({ status: "LIVE", startedAt: earlier }, "FINISHED", now)).toEqual({
      status: "FINISHED",
      finishedAt: now,
    });
  });

  it("reopening keeps the original start time and clears the finish time", () => {
    expect(statusChange({ status: "FINISHED", startedAt: earlier }, "LIVE", now)).toEqual({
      status: "LIVE",
      startedAt: earlier,
      finishedAt: null,
    });
  });

  it("undoing a start clears both times", () => {
    expect(statusChange({ status: "LIVE", startedAt: earlier }, "SCHEDULED", now)).toEqual({
      status: "SCHEDULED",
      startedAt: null,
      finishedAt: null,
    });
  });

  it("returns null for a change that isn't allowed", () => {
    expect(statusChange({ status: "FINISHED", startedAt: earlier }, "SCHEDULED", now)).toBeNull();
  });
});
