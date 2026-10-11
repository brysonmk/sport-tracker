/**
 * Seeds one DEMO league so there is something to look at in local development.
 *
 * Everything here is invented demo data: the league, teams, players and results are
 * not real people or real games. The league name says so on every page.
 *
 * Run with: npm run db:seed   (safe to re-run: it replaces the demo league)
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { generateAdminToken, hashAdminToken } from "../src/lib/tokens";

const DEMO_SLUG = "demo-league";

const TEAMS: Record<string, string[]> = {
  "Demo Reds": ["Alex Demo", "Sam Sample", "Jordan Test", "Riley Mock", "Casey Example"],
  "Demo Blues": ["Taylor Demo", "Morgan Sample", "Jamie Test", "Drew Mock", "Quinn Example"],
  "Demo Greens": ["Avery Demo", "Parker Sample", "Rowan Test", "Skyler Mock", "Emerson Example"],
  "Demo Golds": ["Hayden Demo", "Reese Sample", "Kendall Test", "Logan Mock", "Finley Example"],
};

type Goal = { team: "home" | "away"; scorer?: string; assist?: string; minute?: number };
type DemoMatch = { home: string; away: string; daysAgo: number; goals: Goal[]; finished: boolean };

// A full round-robin of 4 teams is 6 matches. Five are played, one is still to come.
const MATCHES: DemoMatch[] = [
  {
    home: "Demo Reds", away: "Demo Blues", daysAgo: 35, finished: true,
    goals: [
      { team: "home", scorer: "Alex Demo", assist: "Sam Sample", minute: 12 },
      { team: "away", scorer: "Taylor Demo", minute: 30 },
      { team: "home", scorer: "Jordan Test", assist: "Alex Demo", minute: 61 },
    ],
  },
  {
    home: "Demo Greens", away: "Demo Golds", daysAgo: 35, finished: true,
    goals: [
      { team: "home", scorer: "Avery Demo", minute: 8 },
      { team: "away", scorer: "Hayden Demo", assist: "Reese Sample", minute: 44 },
    ],
  },
  {
    home: "Demo Reds", away: "Demo Greens", daysAgo: 28, finished: true,
    goals: [
      { team: "away", scorer: "Parker Sample", assist: "Avery Demo", minute: 20 },
      { team: "away", scorer: "Avery Demo", minute: 55 },
      // Own goal / unknown scorer: counts for the score, not for any player.
      { team: "home", minute: 70 },
    ],
  },
  {
    home: "Demo Blues", away: "Demo Golds", daysAgo: 28, finished: true,
    goals: [
      { team: "home", scorer: "Morgan Sample", assist: "Taylor Demo", minute: 15 },
      { team: "home", scorer: "Taylor Demo", assist: "Jamie Test", minute: 33 },
      { team: "away", scorer: "Kendall Test", minute: 80 },
      { team: "home", scorer: "Taylor Demo", minute: 88 },
    ],
  },
  {
    home: "Demo Reds", away: "Demo Golds", daysAgo: 21, finished: true,
    goals: [],
  },
  { home: "Demo Blues", away: "Demo Greens", daysAgo: -7, finished: false, goals: [] },
];

/** A date `days` from today at 23:00 UTC (7 pm in US/Canada Eastern summer time). */
function daysFromNow(days: number): Date {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  date.setUTCHours(23, 0, 0, 0);
  return date;
}

async function main() {
  // Remove the previous demo league. Matches go first: a team can't be deleted while a
  // match or goal still points at it (on purpose, see schema.prisma), and deleting the
  // matches cascades to their goals. Then the league cascades to its teams and players.
  await db.$transaction([
    db.match.deleteMany({ where: { league: { slug: DEMO_SLUG } } }),
    db.league.deleteMany({ where: { slug: DEMO_SLUG } }),
  ]);

  const adminToken = generateAdminToken();
  const league = await db.league.create({
    data: {
      slug: DEMO_SLUG,
      name: "Demo League (sample data)",
      adminTokenHash: hashAdminToken(adminToken),
    },
  });

  const teamIds = new Map<string, string>();
  const playerIds = new Map<string, string>();

  for (const [teamName, playerNames] of Object.entries(TEAMS)) {
    const team = await db.team.create({ data: { leagueId: league.id, name: teamName } });
    teamIds.set(teamName, team.id);
    for (const name of playerNames) {
      const player = await db.player.create({
        data: { leagueId: league.id, teamId: team.id, name },
      });
      playerIds.set(name, player.id);
    }
  }

  for (const m of MATCHES) {
    const homeTeamId = teamIds.get(m.home)!;
    const awayTeamId = teamIds.get(m.away)!;
    const kickoffAt = daysFromNow(-m.daysAgo);
    await db.match.create({
      data: {
        leagueId: league.id,
        homeTeamId,
        awayTeamId,
        kickoffAt,
        status: m.finished ? "FINISHED" : "SCHEDULED",
        startedAt: m.finished ? kickoffAt : null,
        finishedAt: m.finished ? new Date(kickoffAt.getTime() + 90 * 60 * 1000) : null,
        events: {
          create: m.goals.map((g) => ({
            teamId: g.team === "home" ? homeTeamId : awayTeamId,
            scorerId: g.scorer ? playerIds.get(g.scorer) : null,
            assistId: g.assist ? playerIds.get(g.assist) : null,
            minute: g.minute ?? null,
          })),
        },
      },
    });
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  console.log("Seeded demo league (demo data, not real people).");
  console.log(`  Public link: ${baseUrl}/l/${league.slug}`);
  console.log(`  Admin link:  ${baseUrl}/a/${adminToken}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
