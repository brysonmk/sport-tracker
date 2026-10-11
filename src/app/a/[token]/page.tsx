import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchList } from "@/components/MatchCard";
import { buttonClasses } from "@/components/ui/Button";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { CopyLink } from "@/components/ui/CopyLink";
import { groupMatches } from "@/domain/matchList";
import { findLeagueByAdminToken } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";
import { MatchForm } from "./_components/MatchForm";

export default async function AdminMatchesPage({ params, searchParams }: PageProps<"/a/[token]">) {
  const { token } = await params;
  const { created } = await searchParams;
  const league = await findLeagueByAdminToken(token);
  if (!league) notFound();

  const { teams, matches } = await getLeagueSnapshot(league.id);
  const { live, upcoming, results } = groupMatches(matches);
  const hrefFor = (m: { id: string }) => `/a/${token}/matches/${m.id}`;

  return (
    <div>
      {created === "1" && (
        <Card className="mb-8 border-accent bg-accent-soft">
          <h2 className="mb-1 text-lg font-semibold">Your league is ready 🎉</h2>
          <p className="mb-4 text-sm">
            Save your <strong>admin link</strong> somewhere safe (bookmark it or send it to yourself). It&apos;s the
            only way to edit this league, and it can&apos;t be recovered.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-sm font-medium">Admin link (keep it private)</p>
              <CopyLink path={`/a/${token}`} label="Admin link" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Public link (share with everyone)</p>
              <CopyLink path={`/l/${league.slug}`} label="Public link" />
            </div>
          </div>
          <p className="mt-4 text-sm">
            Next step:{" "}
            <Link href={`/a/${token}/teams`} className="font-medium underline">
              add your teams and players
            </Link>
            .
          </p>
        </Card>
      )}

      <Section title="New match" id="new-match">
        {teams.length < 2 ? (
          <EmptyState>
            You need at least two teams to create a match.{" "}
            <Link href={`/a/${token}/teams`} className="font-medium text-accent underline">
              Add teams
            </Link>
          </EmptyState>
        ) : (
          <Card>
            <MatchForm token={token} teams={teams} />
          </Card>
        )}
      </Section>

      {live.length > 0 && (
        <Section title="Live now" id="live">
          <MatchList matches={live} hrefFor={hrefFor} />
        </Section>
      )}

      <Section title="Upcoming" id="upcoming">
        {upcoming.length ? <MatchList matches={upcoming} hrefFor={hrefFor} /> : <EmptyState>No upcoming matches.</EmptyState>}
      </Section>

      <Section title="Results" id="results">
        {results.length ? <MatchList matches={results} hrefFor={hrefFor} /> : <EmptyState>No finished matches yet.</EmptyState>}
      </Section>

      {matches.length === 0 && teams.length >= 2 && (
        <p className="mt-6 text-center text-sm text-muted">
          Create a match above, then open it to record goals.{" "}
          <Link href={`/l/${league.slug}`} className={buttonClasses("ghost", "min-h-0 px-0 underline")}>
            See the public page
          </Link>
        </p>
      )}
    </div>
  );
}
