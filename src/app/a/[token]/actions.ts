"use server";

/**
 * Every write an admin can make. Each action follows the same four steps:
 *
 *   1. requireAdminLeague(token)  → which league; throws for a bad token
 *   2. parse the input with zod    → return field errors to the form if invalid
 *   3. write, always filtered by league.id so ids from another league are ignored
 *   4. revalidateLeague(...)       → admin and public pages re-render with the change
 *
 * The token is the first argument; forms pass it with `action.bind(null, token)`.
 */

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { elapsedMinute } from "@/domain/matchClock";
import { statusChange } from "@/domain/matchStatus";
import type { MatchStatus } from "@/domain/types";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/formState";
import { requireAdminLeague, revalidateLeague } from "@/server/admin";
import {
  formToObject,
  fromZodError,
  goalSchema,
  leagueNameSchema,
  matchSchema,
  playerSchema,
  teamNameSchema,
} from "@/server/schemas";

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// ─── League ──────────────────────────────────────────────────────────────────

export async function renameLeague(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = leagueNameSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };

  await db.league.update({ where: { id: league.id }, data: { name: parsed.data.name } });
  revalidateLeague(league, token);
  return { ok: true };
}

// ─── Teams ───────────────────────────────────────────────────────────────────

export async function addTeam(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = teamNameSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };

  try {
    await db.team.create({ data: { leagueId: league.id, name: parsed.data.name } });
  } catch (error) {
    if (isUniqueViolation(error)) return { fieldErrors: { name: ["There is already a team with that name"] }, values };
    throw error;
  }
  revalidateLeague(league, token);
  return { ok: true };
}

export async function renameTeam(token: string, teamId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = teamNameSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };

  try {
    await db.team.updateMany({ where: { id: teamId, leagueId: league.id }, data: { name: parsed.data.name } });
  } catch (error) {
    if (isUniqueViolation(error)) return { fieldErrors: { name: ["There is already a team with that name"] }, values };
    throw error;
  }
  revalidateLeague(league, token);
  return { ok: true };
}

export async function deleteTeam(token: string, teamId: string): Promise<void> {
  const league = await requireAdminLeague(token);
  const matchCount = await db.match.count({
    where: { leagueId: league.id, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
  });
  // The page hides the delete button in this case; this protects against stale pages.
  if (matchCount > 0) throw new Error("This team has matches. Delete its matches first.");

  // Its players stay in the league as free agents (Player.teamId is set to null).
  await db.team.deleteMany({ where: { id: teamId, leagueId: league.id } });
  revalidateLeague(league, token);
}

// ─── Players ─────────────────────────────────────────────────────────────────

/** A team id from a form is only accepted if that team is in this league. */
async function teamInLeague(teamId: string | null, leagueId: string) {
  if (!teamId) return true;
  return (await db.team.count({ where: { id: teamId, leagueId } })) > 0;
}

export async function addPlayer(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = playerSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };
  if (!(await teamInLeague(parsed.data.teamId, league.id))) return { fieldErrors: { teamId: ["Pick a team"] }, values };

  try {
    await db.player.create({ data: { leagueId: league.id, ...parsed.data } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { name: ["There is already a player with that name (add an initial?)"] }, values };
    }
    throw error;
  }
  revalidateLeague(league, token);
  // Keep the chosen team selected so several players can be added in a row.
  return { ok: true, values: { teamId: values.teamId ?? "" } };
}

export async function updatePlayer(token: string, playerId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = playerSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };
  if (!(await teamInLeague(parsed.data.teamId, league.id))) return { fieldErrors: { teamId: ["Pick a team"] }, values };

  try {
    await db.player.updateMany({ where: { id: playerId, leagueId: league.id }, data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { fieldErrors: { name: ["There is already a player with that name"] }, values };
    throw error;
  }
  revalidateLeague(league, token);
  return { ok: true };
}

export async function deletePlayer(token: string, playerId: string): Promise<void> {
  const league = await requireAdminLeague(token);
  // Their goals stay in the score (scorer becomes "unknown"); see MatchEvent in schema.prisma.
  await db.player.deleteMany({ where: { id: playerId, leagueId: league.id } });
  revalidateLeague(league, token);
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function createMatch(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = matchSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };

  const { homeTeamId, awayTeamId, kickoffAt } = parsed.data;
  const teamsFound = await db.team.count({ where: { leagueId: league.id, id: { in: [homeTeamId, awayTeamId] } } });
  if (teamsFound !== 2) return { error: "Pick two teams from this league", values };

  const match = await db.match.create({ data: { leagueId: league.id, homeTeamId, awayTeamId, kickoffAt } });
  revalidateLeague(league, token);
  redirect(`/a/${token}/matches/${match.id}`);
}

export async function deleteMatch(token: string, matchId: string): Promise<void> {
  const league = await requireAdminLeague(token);
  await db.match.deleteMany({ where: { id: matchId, leagueId: league.id } }); // events cascade
  revalidateLeague(league, token);
  redirect(`/a/${token}`);
}

export async function changeMatchStatus(token: string, matchId: string, to: MatchStatus): Promise<void> {
  const league = await requireAdminLeague(token);
  const match = await db.match.findFirst({ where: { id: matchId, leagueId: league.id } });
  if (!match) throw new Error("Match not found");

  const change = statusChange(match, to, new Date());
  if (!change) throw new Error(`Can't change a ${match.status.toLowerCase()} match to ${to.toLowerCase()}`);

  await db.match.update({ where: { id: match.id }, data: change });
  revalidateLeague(league, token);
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function addGoal(token: string, matchId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const values = formToObject(formData);
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) return { ...fromZodError(parsed.error), values };
  const goal = parsed.data;

  const match = await db.match.findFirst({ where: { id: matchId, leagueId: league.id } });
  if (!match) return { error: "Match not found" };
  if (goal.teamId !== match.homeTeamId && goal.teamId !== match.awayTeamId) {
    return { fieldErrors: { teamId: ["Pick one of the two teams in this match"] }, values };
  }
  const playerIds = [goal.scorerId, goal.assistId].filter((id): id is string => Boolean(id));
  const playersFound = await db.player.count({ where: { leagueId: league.id, id: { in: playerIds } } });
  if (playersFound !== playerIds.length) return { error: "Pick players from this league", values };

  // During a live match an empty minute means "now": take it from the match clock.
  const now = new Date();
  const minute = goal.minute ?? (match.status === "LIVE" && match.startedAt ? elapsedMinute(match.startedAt, now) : null);

  // Create the goal and bump match.updatedAt together: public pages poll the league's
  // latest updatedAt to know when to refresh (see src/app/api/leagues/[slug]/version).
  await db.$transaction([
    db.matchEvent.create({ data: { matchId: match.id, ...goal, minute } }),
    db.match.update({ where: { id: match.id }, data: { updatedAt: now } }),
  ]);
  revalidateLeague(league, token);
  return { ok: true };
}

export async function deleteGoal(token: string, goalId: string): Promise<void> {
  const league = await requireAdminLeague(token);
  const goal = await db.matchEvent.findFirst({ where: { id: goalId, match: { leagueId: league.id } } });
  if (!goal) return; // already gone (double tap)

  await db.$transaction([
    db.matchEvent.delete({ where: { id: goal.id } }),
    db.match.update({ where: { id: goal.matchId }, data: { updatedAt: new Date() } }),
  ]);
  revalidateLeague(league, token);
}
