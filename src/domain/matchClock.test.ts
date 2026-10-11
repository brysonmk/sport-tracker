import { describe, expect, it } from "vitest";
import { elapsedMinute } from "./matchClock";

const start = new Date("2026-10-11T18:00:00Z");
const after = (seconds: number) => new Date(start.getTime() + seconds * 1000);

describe("elapsedMinute", () => {
  it.each([
    [0, 1],
    [59, 1],
    [60, 2],
    [22 * 60 + 10, 23],
    [90 * 60, 91],
  ])("%is after kickoff is minute %i", (seconds, minute) => {
    expect(elapsedMinute(start, after(seconds))).toBe(minute);
  });

  it("treats a clock slightly behind the start time as minute 1", () => {
    expect(elapsedMinute(start, after(-5))).toBe(1);
  });

  it("caps at 200", () => {
    expect(elapsedMinute(start, after(10 * 60 * 60))).toBe(200);
  });
});
