import { outcomeFor, scoreOf } from "./score";
import type { MatchInput, TeamInput } from "./types";

/** Soccer points: 3 for a win, 1 for a draw, 0 for a loss. */
export const POINTS = { W: 3, D: 1, L: 0 } as const;

export type StandingsRow = {
  /** 1-based. Teams that can't be separated by any tiebreaker share a position. */
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type Tally = Omit<StandingsRow, "position" | "teamName">;

/**
 * Builds the league table from finished matches.
 *
 * Order (the same as the Premier League):
 *   1. points
 *   2. goal difference
 *   3. goals scored
 *   4. head-to-head: a mini-table of only the matches between the tied teams
 *      (points, then goal difference, then goals scored in those matches)
 *   5. still level: the teams share a position, listed alphabetically
 *
 * Scheduled and live matches are ignored, so the table only moves when a match ends.
 */
export function computeStandings(teams: TeamInput[], matches: MatchInput[]): StandingsRow[] {
  const finished = matches.filter((m) => m.status === "FINISHED");
  const overall = tally(teams.map((t) => t.id), finished);
  const nameOf = new Map(teams.map((t) => [t.id, t.name]));

  // Steps 1-3: sort by the overall table, then cut it into groups that are level on it.
  const sorted = [...teams].sort((a, b) => compareTallies(overall.get(a.id)!, overall.get(b.id)!));
  const levelGroups = groupConsecutive(sorted, (a, b) =>
    compareTallies(overall.get(a.id)!, overall.get(b.id)!) === 0,
  );

  // Step 4 and 5: inside each level group, order by head-to-head, then by name.
  const rows: StandingsRow[] = [];
  for (const group of levelGroups) {
    const ids = group.map((t) => t.id);
    const headToHead = tally(ids, finished.filter((m) => ids.includes(m.homeTeamId) && ids.includes(m.awayTeamId)));
    const compareH2H = (a: TeamInput, b: TeamInput) =>
      compareTallies(headToHead.get(a.id)!, headToHead.get(b.id)!);

    const ordered = [...group].sort((a, b) => compareH2H(a, b) || a.name.localeCompare(b.name));

    ordered.forEach((team, i) => {
      const previous = rows.at(-1);
      // Shares the position of the team above it only when head-to-head can't split them
      // either (they are already level on the overall table, being in the same group).
      const sharesPosition = i > 0 && compareH2H(ordered[i - 1], team) === 0;
      rows.push({
        position: sharesPosition && previous ? previous.position : rows.length + 1,
        teamName: nameOf.get(team.id)!,
        ...overall.get(team.id)!,
      });
    });
  }
  return rows;
}

/** Counts W/D/L, goals and points for the given teams over the given matches. */
function tally(teamIds: string[], matches: MatchInput[]): Map<string, Tally> {
  const table = new Map<string, Tally>(
    teamIds.map((teamId) => [
      teamId,
      { teamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
    ]),
  );

  for (const match of matches) {
    const { home, away } = scoreOf(match);
    record(table.get(match.homeTeamId), home, away);
    record(table.get(match.awayTeamId), away, home);
  }
  return table;
}

function record(row: Tally | undefined, goalsFor: number, goalsAgainst: number) {
  if (!row) return; // a team that isn't part of this table (e.g. deleted)
  const outcome = outcomeFor(goalsFor, goalsAgainst);
  row.played++;
  if (outcome === "W") row.won++;
  if (outcome === "D") row.drawn++;
  if (outcome === "L") row.lost++;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  row.points += POINTS[outcome];
}

/** Negative when `a` ranks above `b`. Points, then goal difference, then goals scored. */
function compareTallies(a: Tally, b: Tally): number {
  return b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor;
}

/** Splits a sorted list into runs of neighbours for which `same` is true. */
function groupConsecutive<T>(items: T[], same: (a: T, b: T) => boolean): T[][] {
  const groups: T[][] = [];
  for (const item of items) {
    const current = groups.at(-1);
    if (current && same(current[0], item)) current.push(item);
    else groups.push([item]);
  }
  return groups;
}
