import "server-only";
import { revalidatePath } from "next/cache";
import { findLeagueByAdminToken } from "./leagues";

/**
 * The gatekeeper for every admin write. Server actions are public HTTP endpoints, so
 * each one calls this first: no valid token, no write.
 *
 * Every query after it filters by the returned league's id (e.g.
 * `where: { id: teamId, leagueId: league.id }`), so a valid token for league A can't
 * touch league B's data by sending B's ids.
 */
export async function requireAdminLeague(token: string) {
  const league = await findLeagueByAdminToken(token);
  if (!league) throw new Error("This admin link is not valid.");
  return league;
}

/** Re-render the admin and public pages of a league after a change. */
export function revalidateLeague(league: { slug: string }, token: string) {
  revalidatePath(`/a/${token}`, "layout");
  revalidatePath(`/l/${league.slug}`, "layout");
}
