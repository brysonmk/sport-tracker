/**
 * Plain data shapes the domain functions work on. They are deliberately smaller than
 * the Prisma models: a function only asks for the fields it needs, so tests can build
 * inputs by hand and the functions never touch the database.
 */

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

export type TeamInput = { id: string; name: string };

/** A goal: which team it counts for, and (if known) who scored and assisted. */
export type GoalInput = {
  teamId: string;
  scorerId: string | null;
  assistId: string | null;
};

export type MatchInput = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  status: MatchStatus;
  goals: GoalInput[];
};

export type PlayerInput = { id: string; name: string; teamName: string | null };
