import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowPlayerButton } from "@/components/FollowPlayerButton";
import { StepChart } from "@/components/StepChart";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { LocalTime } from "@/components/ui/LocalTime";
import { goalsAndAssistsSeries } from "@/domain/chartSeries";
import { groupMatches, matchTime } from "@/domain/matchList";
import { playerLog } from "@/domain/playerLog";
import type { Outcome } from "@/domain/score";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export async function generateMetadata({ params }: PageProps<"/l/[slug]/players/[playerId]">) {
  const { slug, playerId } = await params;
  const league = await findLeagueBySlug(slug);
  const player = league ? (await getLeagueSnapshot(league.id)).players.find((p) => p.id === playerId) : undefined;
  return player ? { title: player.name } : {};
}

const OUTCOME_STYLE: Record<Outcome, string> = {
  W: "bg-accent-soft text-accent",
  D: "bg-bg text-muted",
  L: "bg-live/10 text-live",
};

export default async function PlayerPage({ params }: PageProps<"/l/[slug]/players/[playerId]">) {
  const { slug, playerId } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const { players, playerStats, matches } = await getLeagueSnapshot(league.id);
  const player = players.find((p) => p.id === playerId);
  const stats = playerStats.find((s) => s.playerId === playerId);
  if (!player || !stats) notFound();

  // Rank among scorers: 1 + number of players with more goals (ties share a rank).
  const rank = stats.goals > 0 ? 1 + playerStats.filter((s) => s.goals > stats.goals).length : null;
  const chronological = playerLog(playerId, matches);
  const log = [...chronological].reverse(); // newest first, for the list
  const { goals, assists } = goalsAndAssistsSeries(chronological);
  // The chart spans the league's season so far: first to latest finished match.
  const { results } = groupMatches(matches);
  const seasonStart = results.at(-1) ? matchTime(results.at(-1)!).getTime() : 0;
  const seasonEnd = results[0] ? matchTime(results[0]).getTime() : 0;

  const tiles = [
    { label: "Goals", value: stats.goals },
    { label: "Assists", value: stats.assists },
    { label: "G+A", value: stats.contributions },
    { label: "Scorer rank", value: rank ? `#${rank}` : "–" },
  ];

  return (
    <div>
      <Link href={`/l/${slug}/players`} className="mb-4 inline-block text-sm text-muted hover:text-fg">
        ← All players
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{player.name}</h2>
          <p className="text-sm text-muted">{player.teamName ?? "No team"}</p>
        </div>
        <FollowPlayerButton slug={slug} playerId={player.id} name={player.name} />
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="py-3 text-center">
            <dt className="text-xs text-muted">{tile.label}</dt>
            <dd className="tabular text-2xl font-bold">{tile.value}</dd>
          </Card>
        ))}
      </dl>

      {chronological.length > 0 && (
        <Section title="Over the season" id="chart">
          <Card>
            <StepChart
              description={`${player.name}'s goals and assists so far this season`}
              start={seasonStart}
              end={seasonEnd}
              series={[
                { key: "goals", label: "Goals", points: goals },
                { key: "assists", label: "Assists", points: assists },
              ]}
            />
          </Card>
        </Section>
      )}

      <Section title="Goals and assists by match" id="log">
        {log.length === 0 ? (
          <EmptyState>No goals or assists in finished matches yet.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {log.map((entry) => (
              <li key={entry.matchId}>
                <Link
                  href={`/l/${slug}/matches/${entry.matchId}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 hover:border-accent"
                >
                  {entry.outcome && (
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${OUTCOME_STYLE[entry.outcome]}`}
                      title={{ W: "Win", D: "Draw", L: "Loss" }[entry.outcome]}
                    >
                      {entry.outcome}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{entry.label}</span>
                    <span className="text-xs text-muted">
                      <LocalTime date={entry.date} format="date" />
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-sm">
                    {entry.goals > 0 && <span>{entry.goals} G</span>}
                    {entry.goals > 0 && entry.assists > 0 && " · "}
                    {entry.assists > 0 && <span>{entry.assists} A</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
