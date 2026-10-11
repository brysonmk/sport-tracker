/**
 * Works out where a pasted league link should go. Accepts a full URL from any host
 * (the link may have been copied from production while you're on localhost) or just
 * the path. Returns the app path, or null if it isn't a league link.
 *
 *   "https://x.app/a/<token>"      -> "/a/<token>"   (admin)
 *   "x.app/l/sunday-5s-k3x9/players" -> "/l/sunday-5s-k3x9" (public)
 */
export function parseLeagueLink(input: string): string | null {
  const text = input.trim();
  const admin = text.match(/(?:^|\/)a\/([A-Za-z0-9_-]{32})(?:[/?#]|$)/);
  if (admin) return `/a/${admin[1]}`;
  const league = text.match(/(?:^|\/)l\/([a-z0-9-]+)(?:[/?#]|$)/);
  if (league) return `/l/${league[1]}`;
  return null;
}
