import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GoalTimeline } from "@/components/GoalTimeline";
import { RecapCard } from "@/components/RecapCard";
import { Scoreboard } from "@/components/Scoreboard";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import type { MatchStatus } from "@/domain/types";
import { findLeagueByAdminToken } from "@/server/leagues";
import { recapsEnabled } from "@/server/recap";
import { getLeagueSnapshot } from "@/server/snapshot";
import { changeMatchStatus, deleteGoal, deleteMatch } from "../../actions";
import { GoalForm } from "../../_components/GoalForm";
import { RecapForm } from "../../_components/RecapForm";

export const metadata: Metadata = { title: "Record match" };

/** The buttons shown for each status: [target status, label, style]. */
const STATUS_BUTTONS: Record<MatchStatus, [MatchStatus, string, "primary" | "secondary"][]> = {
  SCHEDULED: [
    ["LIVE", "Start match (live)", "primary"],
    ["FINISHED", "Mark as finished", "secondary"],
  ],
  LIVE: [
    ["FINISHED", "Finish match", "primary"],
    ["SCHEDULED", "Undo start", "secondary"],
  ],
  FINISHED: [["LIVE", "Reopen match", "secondary"]],
};

export default async function AdminMatchPage({ params }: PageProps<"/a/[token]/matches/[matchId]">) {
  const { token, matchId } = await params;
  const league = await findLeagueByAdminToken(token);
  if (!league) notFound();

  const { matches, players } = await getLeagueSnapshot(league.id);
  const match = matches.find((m) => m.id === matchId);
  if (!match) notFound();

  return (
    <div>
      <Link href={`/a/${token}`} className="mb-4 inline-block text-sm text-muted hover:text-fg">
        ← All matches
      </Link>

      <Scoreboard match={match} />

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_BUTTONS[match.status].map(([to, label, variant]) => (
          <form key={to} action={changeMatchStatus.bind(null, token, match.id, to)} className="flex-1">
            <Button type="submit" variant={variant} className="w-full">
              {label}
            </Button>
          </form>
        ))}
      </div>

      <Section title="Add a goal" id="add-goal">
        <Card>
          <GoalForm token={token} matchId={match.id} home={match.home} away={match.away} players={players} isLive={match.status === "LIVE"} />
        </Card>
      </Section>

      <Section title="Goals" id="goals">
        {match.goals.length === 0 ? (
          <EmptyState>No goals yet.</EmptyState>
        ) : (
          <Card>
            <GoalTimeline
              goals={match.goals}
              renderAction={(goal) => (
                <ConfirmButton
                  action={deleteGoal.bind(null, token, goal.id)}
                  confirmMessage="Remove this goal?"
                  variant="ghost"
                  className="min-h-9 px-2"
                  ariaLabel={`Remove goal by ${goal.scorer?.name ?? "unknown scorer"}`}
                >
                  ✕
                </ConfirmButton>
              )}
            />
          </Card>
        )}
      </Section>

      {/* Only when ANTHROPIC_API_KEY is set, and only for finished matches. */}
      {recapsEnabled() && match.status === "FINISHED" && (
        <Section title="AI recap" id="recap">
          <div className="flex flex-col gap-3">
            {match.recap ? (
              <RecapCard recap={match.recap} />
            ) : (
              <p className="text-sm text-muted">Write a short summary of this match for the public page.</p>
            )}
            <RecapForm token={token} matchId={match.id} hasRecap={Boolean(match.recap)} />
          </div>
        </Section>
      )}

      <Section title="Danger zone" id="danger">
        <ConfirmButton
          action={deleteMatch.bind(null, token, match.id)}
          confirmMessage={`Delete ${match.home.name} vs ${match.away.name} and all its goals?`}
        >
          Delete match
        </ConfirmButton>
      </Section>
    </div>
  );
}
