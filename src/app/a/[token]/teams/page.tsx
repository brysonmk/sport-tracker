import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, EmptyState, Section } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { findLeagueByAdminToken } from "@/server/leagues";
import { getLeagueSnapshot, type PlayerView } from "@/server/snapshot";
import { deletePlayer, deleteTeam } from "../actions";
import { AddPlayerForm, EditPlayerForm } from "../_components/PlayerForms";
import { AddTeamForm, RenameTeamForm } from "../_components/TeamForms";

export const metadata: Metadata = { title: "Teams & players" };

export default async function AdminTeamsPage({ params }: PageProps<"/a/[token]/teams">) {
  const { token } = await params;
  const league = await findLeagueByAdminToken(token);
  if (!league) notFound();

  const { teams, players, matches } = await getLeagueSnapshot(league.id);
  const matchCount = (teamId: string) =>
    matches.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId).length;

  // Group players under their team; players without a team go in "Free agents".
  const groups: { id: string; name: string; players: PlayerView[] }[] = [
    ...teams.map((t) => ({ ...t, players: players.filter((p) => p.teamId === t.id) })),
    { id: "none", name: "Free agents", players: players.filter((p) => !p.teamId) },
  ].filter((g) => g.id !== "none" || g.players.length > 0);

  return (
    <div>
      <Section title="Teams" id="teams">
        <Card className="mb-3">
          <AddTeamForm token={token} />
        </Card>
        {teams.length === 0 ? (
          <EmptyState>No teams yet. Add at least two to create a match.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {teams.map((team) => {
              const count = matchCount(team.id);
              return (
                <li key={team.id}>
                  <Card className="py-3">
                    <details>
                      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2">
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-muted">
                          Edit<span className="sr-only"> {team.name}</span>
                        </span>
                      </summary>
                      <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                        <RenameTeamForm token={token} team={team} />
                        {count > 0 ? (
                          <p className="text-sm text-muted">
                            This team has {count} match{count === 1 ? "" : "es"}, so it can&apos;t be deleted.
                          </p>
                        ) : (
                          <ConfirmButton
                            action={deleteTeam.bind(null, token, team.id)}
                            confirmMessage={`Delete ${team.name}? Its players become free agents.`}
                            ariaLabel={`Delete team ${team.name}`}
                          >
                            Delete team
                          </ConfirmButton>
                        )}
                      </div>
                    </details>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Players" id="players">
        <Card className="mb-3">
          <AddPlayerForm token={token} teams={teams} />
        </Card>
        {players.length === 0 ? (
          <EmptyState>No players yet. Players are optional: goals can be recorded without a scorer.</EmptyState>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-2 text-sm font-semibold text-muted">
                  {group.name} <span className="font-normal">({group.players.length})</span>
                </h3>
                {group.players.length === 0 ? (
                  <p className="text-sm text-muted">No players.</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {group.players.map((player) => (
                      <li key={player.id}>
                        <Card className="py-2.5">
                          <details>
                            <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2">
                              <span>{player.name}</span>
                              <span className="text-sm text-muted">
                                Edit<span className="sr-only"> {player.name}</span>
                              </span>
                            </summary>
                            <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                              <EditPlayerForm token={token} player={player} teams={teams} />
                              <ConfirmButton
                                action={deletePlayer.bind(null, token, player.id)}
                                confirmMessage={`Delete ${player.name}? Their goals stay in the scores but no longer count for them.`}
                                ariaLabel={`Delete player ${player.name}`}
                              >
                                Delete player
                              </ConfirmButton>
                            </div>
                          </details>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
