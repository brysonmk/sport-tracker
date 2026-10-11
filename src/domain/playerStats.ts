import type { MatchInput, PlayerInput } from "./types";

export type PlayerStatsRow = {
  playerId: string;
  playerName: string;
  teamName: string | null;
  goals: number;
  assists: number;
  /** Goals + assists ("goal contributions"). */
  contributions: number;
};

/**
 * Goals and assists per player over finished matches (same rule as the standings, so
 * the two pages always agree). Every player gets a row, even with zero.
 *
 * Sorted by goals, then assists, then name.
 */
export function computePlayerStats(players: PlayerInput[], matches: MatchInput[]): PlayerStatsRow[] {
  const rows = new Map<string, PlayerStatsRow>(
    players.map((p) => [
      p.id,
      { playerId: p.id, playerName: p.name, teamName: p.teamName, goals: 0, assists: 0, contributions: 0 },
    ]),
  );

  for (const match of matches) {
    if (match.status !== "FINISHED") continue;
    for (const goal of match.goals) {
      const scorer = goal.scorerId ? rows.get(goal.scorerId) : undefined;
      const assister = goal.assistId ? rows.get(goal.assistId) : undefined;
      if (scorer) scorer.goals++;
      if (assister && assister !== scorer) assister.assists++;
    }
  }

  return [...rows.values()]
    .map((row) => ({ ...row, contributions: row.goals + row.assists }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.playerName.localeCompare(b.playerName));
}
