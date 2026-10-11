/**
 * Turns CSV rows into a roster to import: player names with an optional team.
 *
 * Accepted shapes:
 *   - with a header row naming the columns: "Player,Team" / "name,team" (any order,
 *     any case; extra columns are ignored)
 *   - without a header: first column = player, second column (optional) = team
 */

export type RosterEntry = { name: string; team: string | null };
export type RosterResult = { entries: RosterEntry[]; problems: string[] };

export const MAX_ROSTER_ROWS = 500;
const MAX_NAME = 40;

const PLAYER_HEADERS = ["player", "name", "player name"];
const TEAM_HEADERS = ["team", "team name", "club"];

export function parseRoster(rows: string[][]): RosterResult {
  const problems: string[] = [];
  if (rows.length === 0) return { entries: [], problems: ["The file is empty."] };

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const playerCol = header.findIndex((h) => PLAYER_HEADERS.includes(h));
  const hasHeader = playerCol !== -1;
  const nameAt = hasHeader ? playerCol : 0;
  const teamAt = hasHeader ? header.findIndex((h) => TEAM_HEADERS.includes(h)) : 1;
  const body = hasHeader ? rows.slice(1) : rows;

  if (body.length > MAX_ROSTER_ROWS) {
    problems.push(`Only the first ${MAX_ROSTER_ROWS} rows were read.`);
  }

  const entries: RosterEntry[] = [];
  const seen = new Set<string>();

  for (const [index, row] of body.slice(0, MAX_ROSTER_ROWS).entries()) {
    const line = index + (hasHeader ? 2 : 1); // the line number a spreadsheet shows
    const name = (row[nameAt] ?? "").trim();
    const team = teamAt >= 0 ? (row[teamAt] ?? "").trim() : "";
    const key = name.toLowerCase();

    if (!name) {
      problems.push(`Line ${line}: no player name, skipped.`);
    } else if (name.length > MAX_NAME) {
      problems.push(`Line ${line}: "${name.slice(0, 20)}…" is longer than ${MAX_NAME} characters, skipped.`);
    } else if (team.length > MAX_NAME) {
      problems.push(`Line ${line}: team name longer than ${MAX_NAME} characters, skipped.`);
    } else if (seen.has(key)) {
      problems.push(`Line ${line}: ${name} appears twice, kept the first.`);
    } else {
      seen.add(key);
      entries.push({ name, team: team || null });
    }
  }

  return { entries, problems };
}
