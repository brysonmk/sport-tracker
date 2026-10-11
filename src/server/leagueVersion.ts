import "server-only";
import { db } from "@/lib/db";

/**
 * A short string that changes whenever a league's matches change: a goal is added or
 * removed, a match starts or ends, a match is created or deleted.
 *
 * Every one of those writes touches Match.updatedAt (or the number of matches), so
 * "how many matches + the newest updatedAt" is enough. It's one small aggregate query,
 * cheap enough to answer every few seconds for every viewer.
 */
export async function getLeagueVersion(leagueId: string): Promise<string> {
  const result = await db.match.aggregate({
    where: { leagueId },
    _count: { _all: true },
    _max: { updatedAt: true },
  });
  return `${result._count._all}-${result._max.updatedAt?.getTime() ?? 0}`;
}
