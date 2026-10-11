/**
 * Minimal CSV reading and writing (RFC 4180: commas, double quotes, line breaks inside
 * quotes, "" for a literal quote). Enough for spreadsheets exported from Excel, Google
 * Sheets and Numbers, without a dependency.
 */

/** Parses CSV text into rows of cells. Skips completely empty lines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^﻿/, ""); // Excel adds a byte-order mark

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

/**
 * Builds CSV text. Cells that would be read as a formula by a spreadsheet (starting
 * with = + - @, tab or carriage return) get a leading apostrophe, so a player named
 * "=HYPERLINK(...)" can't run anything when an organiser opens the export.
 * Numbers are written as-is (negative goal difference stays a number).
 */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(formatCell).join(",")).join("\r\n") + "\r\n";
}

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  let text = value;
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
