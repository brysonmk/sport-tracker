/**
 * The match minute as shown on a scoreboard: the 1st minute starts at kickoff, so
 * 0-59 seconds in is minute 1, and 22 min 10 s in is minute 23.
 * Capped at 200 (the largest minute a goal accepts).
 */
export function elapsedMinute(startedAt: Date, now: Date): number {
  const ms = now.getTime() - startedAt.getTime();
  if (ms < 0) return 1;
  return Math.min(Math.floor(ms / 60_000) + 1, 200);
}
