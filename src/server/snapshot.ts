import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { computePlayerStats } from "@/domain/playerStats";
import { scoreOf, type Score } from "@/domain/score";
import { computeStandings } from "@/domain/standings";
import type { MatchStatus } from "@/domain/types";

/**
 * Everything the pages show about one league, loaded in one go.
 *
 * Flow: 3 queries (teams, players, matches with their goals) → plain objects →
 * the pure functions in src/domain compute score, standings and stats.
 *
 * A rec league has tens of matches, so loading all of them per request is cheap and
 * keeps every page consistent (see "Load the whole league per request" in DECISIONS.md).
 */

export type TeamView = { id: string; name: string };
export type PlayerView = { id: string; name: string; teamId: string | null; teamName: string | null };

export type GoalView = {
  id: string;
  teamId: string;
  scorerId: string | null;
  assistId: string | null;
  side: "home" | "away";
  minute: number | null;
  scorer: { id: string; name: string } | null;
  assist: { id: string; name: string } | null;
};

export type MatchView = {
  id: string;
  status: MatchStatus;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  home: TeamView;
  away: TeamView;
  score: Score;
  goals: GoalView[];
};

const nameOnly = { select: { id: true, name: true } } as const;

/** What to load with each match: both teams and every goal with its scorer and assist. */
const matchInclude = {
  homeTeam: nameOnly,
  awayTeam: nameOnly,
  events: {
    include: { scorer: nameOnly, assist: nameOnly },
    orderBy: [{ minute: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  },
} satisfies Prisma.MatchInclude;

type MatchRow = Prisma.MatchGetPayload<{ include: typeof matchInclude }>;

export type LeagueSnapshot = Awaited<ReturnType<typeof loadLeagueSnapshot>>;

async function loadLeagueSnapshot(leagueId: string) {
  const [teams, players, matchRows] = await Promise.all([
    db.team.findMany({ where: { leagueId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.player.findMany({
      where: { leagueId },
      orderBy: { name: "asc" },
      include: { team: { select: { name: true } } },
    }),
    db.match.findMany({ where: { leagueId }, include: matchInclude }),
  ]);

  const matches = matchRows.map(toMatchView);

  const playerViews: PlayerView[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    teamId: p.teamId,
    teamName: p.team?.name ?? null,
  }));

  // MatchView and PlayerView contain every field the domain functions need, so they
  // can be passed straight in.
  const standings = computeStandings(teams, matches);
  const playerStats = computePlayerStats(playerViews, matches);

  return { teams, players: playerViews, matches, standings, playerStats };
}

/** Per-request memoised: a layout and a page asking for the same league share one load. */
export const getLeagueSnapshot = cache(loadLeagueSnapshot);

export function toMatchView(m: MatchRow): MatchView {
  const goals: GoalView[] = m.events.map((e) => ({
    id: e.id,
    teamId: e.teamId,
    scorerId: e.scorerId,
    assistId: e.assistId,
    side: e.teamId === m.homeTeamId ? "home" : "away",
    minute: e.minute,
    scorer: e.scorer,
    assist: e.assist,
  }));
  return {
    id: m.id,
    status: m.status,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    kickoffAt: m.kickoffAt,
    startedAt: m.startedAt,
    finishedAt: m.finishedAt,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    home: m.homeTeam,
    away: m.awayTeam,
    score: scoreOf({ homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, goals }),
    goals,
  };
}
