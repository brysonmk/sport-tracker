/**
 * "Arrange" helpers: put a league into the database directly, so a test only drives the
 * UI for the flow it is actually testing. Much faster and less flaky than clicking
 * through setup screens in every test.
 *
 * They use the app's own Prisma client and token helpers, so the data is exactly what
 * the app would have created.
 */
import { db } from "@/lib/db";
import { generateAdminToken, generateSlug, hashAdminToken } from "@/lib/tokens";

export type TeamSpec = { name: string; players?: string[] };

export type ArrangedLeague = {
  id: string;
  name: string;
  slug: string;
  adminToken: string;
  /** Team id by team name. */
  teamIds: Record<string, string>;
  /** Player id by player name. */
  playerIds: Record<string, string>;
};

export async function createLeague(name: string, teams: TeamSpec[] = []): Promise<ArrangedLeague> {
  const adminToken = generateAdminToken();
  const league = await db.league.create({
    data: { name, slug: generateSlug(name), adminTokenHash: hashAdminToken(adminToken) },
  });

  const teamIds: Record<string, string> = {};
  const playerIds: Record<string, string> = {};
  for (const spec of teams) {
    const team = await db.team.create({ data: { leagueId: league.id, name: spec.name } });
    teamIds[spec.name] = team.id;
    for (const playerName of spec.players ?? []) {
      const player = await db.player.create({ data: { leagueId: league.id, teamId: team.id, name: playerName } });
      playerIds[playerName] = player.id;
    }
  }
  return { id: league.id, name: league.name, slug: league.slug, adminToken, teamIds, playerIds };
}

/** Adds a match between two teams of an arranged league. Returns its id. */
export async function createMatch(
  league: ArrangedLeague,
  home: string,
  away: string,
  options: { status?: "SCHEDULED" | "LIVE" | "FINISHED"; goals?: { team: string; scorer?: string; assist?: string }[] } = {},
): Promise<string> {
  const status = options.status ?? "SCHEDULED";
  const match = await db.match.create({
    data: {
      leagueId: league.id,
      homeTeamId: league.teamIds[home],
      awayTeamId: league.teamIds[away],
      status,
      startedAt: status === "SCHEDULED" ? null : new Date(),
      finishedAt: status === "FINISHED" ? new Date() : null,
      events: {
        create: (options.goals ?? []).map((g) => ({
          teamId: league.teamIds[g.team],
          scorerId: g.scorer ? league.playerIds[g.scorer] : null,
          assistId: g.assist ? league.playerIds[g.assist] : null,
        })),
      },
    },
  });
  return match.id;
}

/** Leagues created through the UI are found by their name, to clean them up. */
export async function findLeagueIdByName(name: string): Promise<string | null> {
  return (await db.league.findFirst({ where: { name }, select: { id: true } }))?.id ?? null;
}

/** Removes a league and everything in it (matches first: see the seed for why). */
export async function deleteLeague(leagueId: string) {
  await db.$transaction([
    db.match.deleteMany({ where: { leagueId } }),
    db.league.deleteMany({ where: { id: leagueId } }),
  ]);
}
