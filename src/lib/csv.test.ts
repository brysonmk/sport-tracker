import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "./csv";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("name,team\nLeo,Lions\nTom,Tigers")).toEqual([
      ["name", "team"],
      ["Leo", "Lions"],
      ["Tom", "Tigers"],
    ]);
  });

  it("handles quotes, commas and line breaks inside quotes, and escaped quotes", () => {
    expect(parseCsv('"Smith, Jo","said ""hi""","two\nlines"')).toEqual([["Smith, Jo", 'said "hi"', "two\nlines"]]);
  });

  it("handles Windows line endings, a byte-order mark and blank lines", () => {
    expect(parseCsv("﻿a,b\r\n\r\nc,d\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("keeps empty cells", () => {
    expect(parseCsv("Leo,\n,Lions")).toEqual([
      ["Leo", ""],
      ["", "Lions"],
    ]);
  });
});

describe("toCsv", () => {
  it("writes rows with CRLF line endings", () => {
    expect(toCsv([["a", 1], ["b", -2]])).toBe("a,1\r\nb,-2\r\n");
  });

  it("quotes cells with commas, quotes or line breaks", () => {
    expect(toCsv([["Smith, Jo", 'say "hi"', "x\ny"]])).toBe('"Smith, Jo","say ""hi""","x\ny"\r\n');
  });

  it("neutralises spreadsheet formulas in text cells", () => {
    expect(toCsv([["=1+1", "+cmd", "-x", "@sum", "ok"]])).toBe("'=1+1,'+cmd,'-x,'@sum,ok\r\n");
  });

  it("writes null and undefined as empty", () => {
    expect(toCsv([[null, undefined, "x"]])).toBe(",,x\r\n");
  });

  it("round-trips through parseCsv", () => {
    const rows = [["name", "note"], ["Jo", 'a "quoted", multi\nline note']];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
});
