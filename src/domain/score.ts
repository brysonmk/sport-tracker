import type { GoalInput } from "./types";

export type Score = { home: number; away: number };

/**
 * The score of a match is the number of goal events credited to each side.
 * (Nothing stores the score; see "Score is derived from events" in docs/DECISIONS.md.)
 */
export function scoreOf(match: {
  homeTeamId: string;
  awayTeamId: string;
  goals: Pick<GoalInput, "teamId">[];
}): Score {
  let home = 0;
  let away = 0;
  for (const goal of match.goals) {
    if (goal.teamId === match.homeTeamId) home++;
    else if (goal.teamId === match.awayTeamId) away++;
  }
  return { home, away };
}

export type Outcome = "W" | "D" | "L";

/** Result from one team's point of view, e.g. 2-1 is "W" for the side with 2. */
export function outcomeFor(goalsFor: number, goalsAgainst: number): Outcome {
  if (goalsFor > goalsAgainst) return "W";
  if (goalsFor < goalsAgainst) return "L";
  return "D";
}
