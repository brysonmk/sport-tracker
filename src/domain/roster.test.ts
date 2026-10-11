import { describe, expect, it } from "vitest";
import { MAX_ROSTER_ROWS, parseRoster } from "./roster";

describe("parseRoster", () => {
  it("reads a file with a header row, in any column order and case", () => {
    const result = parseRoster([
      ["Team", "Number", "Player"],
      ["Lions", "9", "Leo"],
      ["Tigers", "4", " Tom "],
    ]);
    expect(result).toEqual({
      entries: [
        { name: "Leo", team: "Lions" },
        { name: "Tom", team: "Tigers" },
      ],
      problems: [],
    });
  });

  it("reads a file without a header: player, then team", () => {
    expect(parseRoster([["Leo", "Lions"], ["Tom"]]).entries).toEqual([
      { name: "Leo", team: "Lions" },
      { name: "Tom", team: null },
    ]);
  });

  it("skips blank names, too-long names and duplicates, with the spreadsheet line number", () => {
    const result = parseRoster([
      ["player", "team"],
      ["", "Lions"],
      ["x".repeat(41), "Lions"],
      ["Leo", "Lions"],
      ["leo", "Tigers"],
    ]);
    expect(result.entries).toEqual([{ name: "Leo", team: "Lions" }]);
    expect(result.problems).toEqual([
      "Line 2: no player name, skipped.",
      'Line 3: "xxxxxxxxxxxxxxxxxxxx…" is longer than 40 characters, skipped.',
      "Line 5: leo appears twice, kept the first.",
    ]);
  });

  it("reports an empty file", () => {
    expect(parseRoster([])).toEqual({ entries: [], problems: ["The file is empty."] });
  });

  it(`reads at most ${MAX_ROSTER_ROWS} rows`, () => {
    const rows = Array.from({ length: MAX_ROSTER_ROWS + 5 }, (_, i) => [`P${i}`]);
    const result = parseRoster(rows);
    expect(result.entries).toHaveLength(MAX_ROSTER_ROWS);
    expect(result.problems[0]).toMatch(/first 500 rows/);
  });
});
