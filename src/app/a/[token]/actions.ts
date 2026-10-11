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
import { recapFacts } from "@/domain/recap";
import { parseRoster } from "@/domain/roster";
import { statusChange } from "@/domain/matchStatus";
import type { MatchStatus } from "@/domain/types";
import { parseCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/formState";
import { requireAdminLeague, revalidateLeague } from "@/server/admin";
import { recapsEnabled, writeRecap } from "@/server/recap";
import { getLeagueSnapshot } from "@/server/snapshot";
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

/** 200 KB of CSV is thousands of rows; anything bigger is not a roster. */
const MAX_IMPORT_BYTES = 200_000;

/**
 * Adds players (and any teams they name) from CSV text. Players already in the league
 * (same name, ignoring case) are left alone, so importing the same file twice is safe.
 */
export async function importRoster(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const league = await requireAdminLeague(token);
  const csv = formData.get("csv");
  if (typeof csv !== "string" || csv.trim() === "") return { fieldErrors: { csv: ["Paste or choose a CSV file first"] } };
  if (csv.length > MAX_IMPORT_BYTES) return { fieldErrors: { csv: ["That file is too big for a roster (max 200 KB)"] } };

  const { entries, problems } = parseRoster(parseCsv(csv));
  if (entries.length === 0) return { error: problems[0] ?? "No players found in the file", values: { csv } };

  const result = await db.$transaction(async (tx) => {
    const teams = await tx.team.findMany({ where: { leagueId: league.id } });
    const teamIdByName = new Map(teams.map((t) => [t.name.toLowerCase(), t.id]));
    const existing = await tx.player.findMany({ where: { leagueId: league.id }, select: { name: true } });
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

    // New teams first (usually a handful), then every new player in one insert.
    let teamsAdded = 0;
    const newPlayers: { leagueId: string; name: string; teamId: string | null }[] = [];
    for (const entry of entries) {
      if (existingNames.has(entry.name.toLowerCase())) continue;
      let teamId: string | null = null;
      if (entry.team) {
        teamId = teamIdByName.get(entry.team.toLowerCase()) ?? null;
        if (!teamId) {
          teamId = (await tx.team.create({ data: { leagueId: league.id, name: entry.team } })).id;
          teamIdByName.set(entry.team.toLowerCase(), teamId);
          teamsAdded++;
        }
      }
      newPlayers.push({ leagueId: league.id, name: entry.name, teamId });
    }
    await tx.player.createMany({ data: newPlayers });
    return { teamsAdded, playersAdded: newPlayers.length, skipped: entries.length - newPlayers.length };
  });

  revalidateLeague(league, token);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const parts = [`Added ${plural(result.playersAdded, "player")} and ${plural(result.teamsAdded, "team")}.`];
  if (result.skipped) parts.push(`${plural(result.skipped, "player")} already in the league, skipped.`);
  if (problems.length) parts.push(...problems);
  return { ok: true, message: parts.join(" ") };
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

  // A recap describes a final result; any change makes it stale, so it's removed.
  await db.match.update({ where: { id: match.id }, data: { ...change, recap: null, recapAt: null } });
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
    db.match.update({ where: { id: match.id }, data: { updatedAt: now, recap: null, recapAt: null } }),
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
    db.match.update({ where: { id: goal.matchId }, data: { updatedAt: new Date(), recap: null, recapAt: null } }),
  ]);
  revalidateLeague(league, token);
}

// ─── AI recap ────────────────────────────────────────────────────────────────

/** Writes (or rewrites) the AI recap of a finished match. Only when recaps are enabled. */
export async function writeMatchRecap(token: string, matchId: string): Promise<FormState> {
  const league = await requireAdminLeague(token);
  if (!recapsEnabled()) return { error: "AI recaps aren't set up on this server." };

  const match = (await getLeagueSnapshot(league.id)).matches.find((m) => m.id === matchId);
  if (!match) return { error: "Match not found" };
  if (match.status !== "FINISHED") return { error: "Finish the match first; a recap describes the final result." };

  const result = await writeRecap(recapFacts(match));
  if (!result.ok) return { error: result.error };

  await db.match.update({ where: { id: match.id }, data: { recap: result.text, recapAt: new Date() } });
  revalidateLeague(league, token);
  return { ok: true };
}
