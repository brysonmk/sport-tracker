import Link from "next/link";
import { notFound } from "next/navigation";
import { GoalTimeline } from "@/components/GoalTimeline";
import { Scoreboard } from "@/components/Scoreboard";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export async function generateMetadata({ params }: PageProps<"/l/[slug]/matches/[matchId]">) {
  const { slug, matchId } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) return {};
  const match = (await getLeagueSnapshot(league.id)).matches.find((m) => m.id === matchId);
  if (!match) return {};
  const title =
    match.status === "SCHEDULED"
      ? `${match.home.name} vs ${match.away.name}`
      : `${match.home.name} ${match.score.home}–${match.score.away} ${match.away.name}`;
  return { title };
}

export default async function MatchPage({ params }: PageProps<"/l/[slug]/matches/[matchId]">) {
  const { slug, matchId } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const match = (await getLeagueSnapshot(league.id)).matches.find((m) => m.id === matchId);
  if (!match) notFound();

  return (
    <div>
      <Link href={`/l/${slug}/matches`} className="mb-4 inline-block text-sm text-muted hover:text-fg">
        ← All matches
      </Link>
      <Scoreboard match={match} />
      <Section title="Goals" id="goals">
        {match.goals.length ? (
          <Card>
            <GoalTimeline goals={match.goals} />
          </Card>
        ) : (
          <EmptyState>
            {match.status === "SCHEDULED" ? "Not started yet." : match.status === "LIVE" ? "No goals yet." : "No goals in this match."}
          </EmptyState>
        )}
      </Section>
    </div>
  );
}
