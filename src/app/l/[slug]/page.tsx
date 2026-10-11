import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchList } from "@/components/MatchCard";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";
import { StandingsTable } from "@/components/StandingsTable";
import { EmptyState, Section } from "@/components/ui/Card";
import { groupMatches } from "@/domain/matchList";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export default async function LeaguePage({ params }: PageProps<"/l/[slug]">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const { teams, matches, standings, playerStats } = await getLeagueSnapshot(league.id);
  const { live, upcoming, results } = groupMatches(matches);
  const hrefFor = (m: { id: string }) => `/l/${slug}/matches/${m.id}`;
  const topScorers = playerStats.filter((p) => p.goals > 0).slice(0, 5);

  if (teams.length === 0) {
    return <EmptyState>This league has no teams yet. Check back once the organiser has added them.</EmptyState>;
  }

  return (
    <div>
      {live.length > 0 && (
        <Section title="Live now" id="live">
          <MatchList matches={live} hrefFor={hrefFor} />
        </Section>
      )}

      <Section title="Table" id="table">
        <StandingsTable rows={standings} />
        <p className="mt-2 text-xs text-muted">
          Win 3 pts, draw 1. Ties: goal difference, goals scored, then head-to-head. Only finished matches count.
        </p>
      </Section>

      <Section
        title="Latest results"
        id="results"
        action={results.length > 3 ? <Link href={`/l/${slug}/matches`} className="text-sm text-accent">All matches</Link> : undefined}
      >
        {results.length ? <MatchList matches={results.slice(0, 3)} hrefFor={hrefFor} /> : <EmptyState>No results yet.</EmptyState>}
      </Section>

      {upcoming.length > 0 && (
        <Section title="Next up" id="upcoming">
          <MatchList matches={upcoming.slice(0, 3)} hrefFor={hrefFor} />
        </Section>
      )}

      <Section
        title="Top scorers"
        id="top-scorers"
        action={<Link href={`/l/${slug}/players`} className="text-sm text-accent">All players</Link>}
      >
        {topScorers.length ? <PlayerStatsTable rows={topScorers} caption="Top scorers" /> : <EmptyState>No goals yet.</EmptyState>}
      </Section>
    </div>
  );
}
