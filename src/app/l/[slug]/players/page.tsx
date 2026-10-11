import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";
import { StepChart } from "@/components/StepChart";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { groupMatches, matchTime } from "@/domain/matchList";
import { playerLog } from "@/domain/playerLog";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export const metadata: Metadata = { title: "Players" };

export default async function PlayersPage({ params }: PageProps<"/l/[slug]/players">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const { playerStats, matches } = await getLeagueSnapshot(league.id);
  if (playerStats.length === 0) return <EmptyState>No players yet.</EmptyState>;

  // The top 3 scorers' goals over the season (3 = the most lines that stay easy to tell
  // apart, including for colour-blind readers).
  const topScorers = playerStats.filter((p) => p.goals > 0).slice(0, 3);
  const { results } = groupMatches(matches);
  const race = topScorers.map((p) => ({
    key: p.playerId,
    label: p.playerName,
    points: playerLog(p.playerId, matches)
      .filter((e) => e.goals > 0)
      .map((e) => ({ t: e.date.getTime(), value: e.totalGoals })),
  }));

  return (
    <div>
      {race.length > 0 && (
        <Section title="Scoring race" id="race">
          <Card>
            <StepChart
              description="Goals over the season for the top scorers"
              start={matchTime(results.at(-1)!).getTime()}
              end={matchTime(results[0]).getTime()}
              series={race}
            />
          </Card>
        </Section>
      )}
      <Section title="All players" id="all-players">
        <PlayerStatsTable rows={playerStats} slug={slug} />
      </Section>
      <p className="mt-2 text-xs text-muted">Counts finished matches only. Own goals and unknown scorers aren&apos;t credited.</p>
    </div>
  );
}
