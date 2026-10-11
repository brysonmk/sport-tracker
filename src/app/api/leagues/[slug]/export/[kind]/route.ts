import { toCsv } from "@/lib/csv";
import { matchTime } from "@/domain/matchList";
import { EXPORT_KINDS, goalsCsvRows, matchesCsvRows, playersCsvRows, standingsCsvRows, type ExportKind } from "@/lib/exports";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

/**
 * GET /api/leagues/<slug>/export/<kind> → a CSV download.
 * kind = standings | players | matches | goals. Public: it's the same data the public
 * pages show.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/leagues/[slug]/export/[kind]">) {
  const { slug, kind } = await params;
  if (!EXPORT_KINDS.includes(kind as ExportKind)) return new Response("Unknown export", { status: 404 });

  const league = await findLeagueBySlug(slug);
  if (!league) return new Response("League not found", { status: 404 });

  const snapshot = await getLeagueSnapshot(league.id);
  const { standings, playerStats } = snapshot;
  const matches = [...snapshot.matches].sort((a, b) => matchTime(a).getTime() - matchTime(b).getTime());
  const rows = {
    standings: () => standingsCsvRows(standings),
    players: () => playersCsvRows(playerStats),
    matches: () => matchesCsvRows(matches),
    goals: () => goalsCsvRows(matches),
  }[kind as ExportKind]();

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${kind}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
