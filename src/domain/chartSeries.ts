import type { PlayerLogEntry } from "./playerLog";

/**
 * Data helpers for the "over time" charts. Each series is a running total that only
 * changes at certain moments (when a goal is scored), so it is drawn as a step line and
 * read with `valueAt`.
 */

/** `t` is a timestamp in ms; `value` is the running total from that moment on. */
export type SeriesPoint = { t: number; value: number };

/** The running total at time t: the last point at or before t, or 0 before the first. */
export function valueAt(points: SeriesPoint[], t: number): number {
  let value = 0;
  for (const point of points) {
    if (point.t <= t) value = point.value;
    else break;
  }
  return value;
}

/** Whole-number y-axis ticks from 0 to at least `max`, at most ~5 of them (step 1, 2, 5, 10, …). */
export function integerTicks(max: number): number[] {
  const top = Math.max(1, Math.ceil(max));
  const step = [1, 2, 5, 10, 20, 50, 100].find((s) => top / s <= 4) ?? Math.ceil(top / 4);
  const ticks: number[] = [];
  for (let v = 0; v < top + step; v += step) ticks.push(v);
  return ticks;
}

/** A player's cumulative goals and assists, one point per match they were involved in. */
export function goalsAndAssistsSeries(log: PlayerLogEntry[]): { goals: SeriesPoint[]; assists: SeriesPoint[] } {
  return {
    goals: log.filter((e) => e.goals > 0).map((e) => ({ t: e.date.getTime(), value: e.totalGoals })),
    assists: log.filter((e) => e.assists > 0).map((e) => ({ t: e.date.getTime(), value: e.totalAssists })),
  };
}
