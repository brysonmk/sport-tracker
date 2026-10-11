import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchList } from "@/components/MatchCard";
import { EmptyState, Section } from "@/components/ui/Card";
import { groupMatches } from "@/domain/matchList";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export const metadata: Metadata = { title: "Matches" };

export default async function LeagueMatchesPage({ params }: PageProps<"/l/[slug]/matches">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const { matches } = await getLeagueSnapshot(league.id);
  const { live, upcoming, results } = groupMatches(matches);
  const hrefFor = (m: { id: string }) => `/l/${slug}/matches/${m.id}`;

  if (matches.length === 0) return <EmptyState>No matches yet.</EmptyState>;

  return (
    <div>
      {live.length > 0 && (
        <Section title="Live now" id="live">
          <MatchList matches={live} hrefFor={hrefFor} />
        </Section>
      )}
      {upcoming.length > 0 && (
        <Section title="Upcoming" id="upcoming">
          <MatchList matches={upcoming} hrefFor={hrefFor} />
        </Section>
      )}
      <Section title="Results" id="results">
        {results.length ? <MatchList matches={results} hrefFor={hrefFor} /> : <EmptyState>No results yet.</EmptyState>}
      </Section>
    </div>
  );
}
