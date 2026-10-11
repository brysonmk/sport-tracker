import { matchTime } from "./matchList";
import { outcomeFor, scoreOf, type Outcome } from "./score";
import type { MatchStatus } from "./types";

type LogMatch = {
  id: string;
  status: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  home: { name: string };
  away: { name: string };
  kickoffAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  goals: { teamId: string; scorerId: string | null; assistId: string | null }[];
};

export type PlayerLogEntry = {
  matchId: string;
  date: Date;
  /** "Lions 2–1 Tigers" */
  label: string;
  goals: number;
  assists: number;
  /** Result for the side the player scored or assisted for (null only for bad data). */
  outcome: Outcome | null;
  /** Running totals up to and including this match, for charts. */
  totalGoals: number;
  totalAssists: number;
};

/**
 * One player's goal involvements, match by match, oldest first. Only finished matches
 * where the player scored or assisted appear (we don't track who played, only who
 * scored). Running totals make a "goals over time" chart a one-liner.
 */
export function playerLog(playerId: string, matches: LogMatch[]): PlayerLogEntry[] {
  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => matchTime(a).getTime() - matchTime(b).getTime());

  const entries: PlayerLogEntry[] = [];
  let totalGoals = 0;
  let totalAssists = 0;

  for (const match of finished) {
    const scored = match.goals.filter((g) => g.scorerId === playerId);
    const assisted = match.goals.filter((g) => g.assistId === playerId && g.scorerId !== playerId);
    if (scored.length === 0 && assisted.length === 0) continue;

    totalGoals += scored.length;
    totalAssists += assisted.length;

    const { home, away } = scoreOf(match);
    const teamId = (scored[0] ?? assisted[0]).teamId;
    const outcome =
      teamId === match.homeTeamId ? outcomeFor(home, away) : teamId === match.awayTeamId ? outcomeFor(away, home) : null;

    entries.push({
      matchId: match.id,
      date: matchTime(match),
      label: `${match.home.name} ${home}–${away} ${match.away.name}`,
      goals: scored.length,
      assists: assisted.length,
      outcome,
      totalGoals,
      totalAssists,
    });
  }
  return entries;
}
