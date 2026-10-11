import type { MatchStatus } from "./types";

type Listable = {
  status: MatchStatus;
  kickoffAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
};

/** When a match happens(ed), for sorting: planned kickoff, else actual start, else creation. */
export function matchTime(m: Listable): Date {
  return m.kickoffAt ?? m.startedAt ?? m.createdAt;
}

/**
 * Splits matches into the three lists every match page shows:
 *   live      - in progress, oldest kickoff first
 *   upcoming  - scheduled, soonest first
 *   results   - finished, most recent first
 */
export function groupMatches<T extends Listable>(matches: T[]): { live: T[]; upcoming: T[]; results: T[] } {
  const by = (status: MatchStatus) => matches.filter((m) => m.status === status);
  const ascending = (a: T, b: T) => matchTime(a).getTime() - matchTime(b).getTime();
  return {
    live: by("LIVE").sort(ascending),
    upcoming: by("SCHEDULED").sort(ascending),
    results: by("FINISHED").sort((a, b) => ascending(b, a)),
  };
}
