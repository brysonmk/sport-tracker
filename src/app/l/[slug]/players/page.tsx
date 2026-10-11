import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerStatsTable } from "@/components/PlayerStatsTable";
import { EmptyState } from "@/components/ui/Card";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

export const metadata: Metadata = { title: "Players" };

export default async function PlayersPage({ params }: PageProps<"/l/[slug]/players">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const { playerStats } = await getLeagueSnapshot(league.id);
  if (playerStats.length === 0) return <EmptyState>No players yet.</EmptyState>;

  return (
    <div>
      <PlayerStatsTable rows={playerStats} />
      <p className="mt-2 text-xs text-muted">Counts finished matches only. Own goals and unknown scorers aren&apos;t credited.</p>
    </div>
  );
}
