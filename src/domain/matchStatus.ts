import type { MatchStatus } from "./types";

/**
 * Which status changes the admin may make, and what each one does to the timestamps.
 *
 *   SCHEDULED ──start──> LIVE ──finish──> FINISHED
 *       │                 ▲ │                 │
 *       │                 │ └──undo start──> SCHEDULED
 *       │                 └────reopen─────────┘
 *       └──────────finish (result entered after the game)──> FINISHED
 */
const ALLOWED: Record<MatchStatus, MatchStatus[]> = {
  SCHEDULED: ["LIVE", "FINISHED"],
  LIVE: ["FINISHED", "SCHEDULED"],
  FINISHED: ["LIVE"],
};

export function canChangeStatus(from: MatchStatus, to: MatchStatus): boolean {
  return ALLOWED[from].includes(to);
}

export type StatusChange = {
  status: MatchStatus;
  startedAt?: Date | null;
  finishedAt?: Date | null;
};

/** The fields to write for a status change, or null if the change isn't allowed. */
export function statusChange(
  match: { status: MatchStatus; startedAt: Date | null },
  to: MatchStatus,
  now: Date,
): StatusChange | null {
  if (!canChangeStatus(match.status, to)) return null;
  switch (to) {
    case "LIVE":
      // Reopening a finished match keeps its original start time.
      return { status: to, startedAt: match.startedAt ?? now, finishedAt: null };
    case "FINISHED":
      return { status: to, finishedAt: now };
    case "SCHEDULED":
      return { status: to, startedAt: null, finishedAt: null };
  }
}
