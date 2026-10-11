import "server-only";
import { db } from "@/lib/db";
import { MAX_LEAGUES, MAX_PLAYERS } from "@/lib/follows";
import { groupMatches } from "@/domain/matchList";
import { playerLog } from "@/domain/playerLog";
import { getLeagueSnapshot, type MatchView } from "./snapshot";

/**
 * The home page's personal feed: a short summary of each league and player this device
 * follows. Only public information (the same as the public pages show).
 */

export type FeedMatch = {
  id: string;
  status: MatchView["status"];
  home: string;
  away: string;
  score: { home: number; away: number };
  when: string | null;
};

export type FeedLeague = {
  slug: string;
  name: string;
  live: FeedMatch[];
  latest: FeedMatch | null;
  next: FeedMatch | null;
  leader: { teamName: string; points: number } | null;
};

export type FeedPlayer = {
  slug: string;
  playerId: string;
  name: string;
  teamName: string | null;
  goals: number;
  assists: number;
  lastInvolvement: { matchId: string; label: string; date: string; goals: number; assists: number } | null;
};

export type Feed = { leagues: FeedLeague[]; players: FeedPlayer[] };

function toFeedMatch(m: MatchView): FeedMatch {
  const when = m.kickoffAt ?? m.startedAt;
  return { id: m.id, status: m.status, home: m.home.name, away: m.away.name, score: m.score, when: when?.toISOString() ?? null };
}

export async function getFeed(slugs: string[], playerIds: string[]): Promise<Feed> {
  const leagues = await db.league.findMany({ where: { slug: { in: slugs.slice(0, MAX_LEAGUES) } } });
  const wantedPlayers = new Set(playerIds.slice(0, MAX_PLAYERS));

  const feedLeagues: FeedLeague[] = [];
  const feedPlayers: FeedPlayer[] = [];

  for (const league of leagues) {
    const snapshot = await getLeagueSnapshot(league.id);
    const { live, upcoming, results } = groupMatches(snapshot.matches);
    const top = snapshot.standings[0];
    feedLeagues.push({
      slug: league.slug,
      name: league.name,
      live: live.map(toFeedMatch),
      latest: results[0] ? toFeedMatch(results[0]) : null,
      next: upcoming[0] ? toFeedMatch(upcoming[0]) : null,
      leader: top && top.played > 0 ? { teamName: top.teamName, points: top.points } : null,
    });

    for (const stats of snapshot.playerStats.filter((s) => wantedPlayers.has(s.playerId))) {
      const last = playerLog(stats.playerId, snapshot.matches).at(-1);
      feedPlayers.push({
        slug: league.slug,
        playerId: stats.playerId,
        name: stats.playerName,
        teamName: stats.teamName,
        goals: stats.goals,
        assists: stats.assists,
        lastInvolvement: last
          ? { matchId: last.matchId, label: last.label, date: last.date.toISOString(), goals: last.goals, assists: last.assists }
          : null,
      });
    }
  }

  // Keep the order the device sent (most recently visited first).
  feedLeagues.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  return { leagues: feedLeagues, players: feedPlayers };
}
