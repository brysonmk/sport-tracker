import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueVersion } from "@/server/leagueVersion";

/**
 * GET /api/leagues/<slug>/version → { "version": "6-1791685560603" }
 *
 * Polled by <LiveUpdates> on public league pages. When the version differs from the one
 * the page was rendered with, the page refreshes itself. See "Live updates: polling" in
 * docs/DECISIONS.md.
 */
export async function GET(_request: Request, { params }: RouteContext<"/api/leagues/[slug]/version">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) return Response.json({ error: "League not found" }, { status: 404 });

  const version = await getLeagueVersion(league.id);
  return Response.json({ version }, { headers: { "Cache-Control": "no-store" } });
}
