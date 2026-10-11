/**
 * What this device follows: leagues it has visited and players it chose to follow.
 * There are no accounts, so this lives in the browser's localStorage and powers the
 * personal feed on the home page.
 *
 * The list functions are pure (tested in follows.test.ts); the storage functions wrap
 * localStorage, which can be missing or throw (private mode, blocked storage).
 */

export type FollowedLeague = {
  slug: string;
  name: string;
  /** Present when this device has opened the league's admin link. */
  adminToken?: string;
};

export type FollowedPlayer = { slug: string; playerId: string; name: string };

export type Follows = { leagues: FollowedLeague[]; players: FollowedPlayer[] };

export const MAX_LEAGUES = 10;
export const MAX_PLAYERS = 20;

const EMPTY: Follows = { leagues: [], players: [] };

/** Puts the league first (most recent), keeping a known admin token, capped at MAX_LEAGUES. */
export function rememberLeague(follows: Follows, league: FollowedLeague): Follows {
  const existing = follows.leagues.find((l) => l.slug === league.slug);
  const merged: FollowedLeague = { ...league, adminToken: league.adminToken ?? existing?.adminToken };
  if (!merged.adminToken) delete merged.adminToken;
  const others = follows.leagues.filter((l) => l.slug !== league.slug);
  return { ...follows, leagues: [merged, ...others].slice(0, MAX_LEAGUES) };
}

export function forgetLeague(follows: Follows, slug: string): Follows {
  return {
    leagues: follows.leagues.filter((l) => l.slug !== slug),
    players: follows.players.filter((p) => p.slug !== slug),
  };
}

export function isFollowingPlayer(follows: Follows, playerId: string): boolean {
  return follows.players.some((p) => p.playerId === playerId);
}

export function toggleFollowPlayer(follows: Follows, player: FollowedPlayer): Follows {
  if (isFollowingPlayer(follows, player.playerId)) {
    return { ...follows, players: follows.players.filter((p) => p.playerId !== player.playerId) };
  }
  return { ...follows, players: [player, ...follows.players].slice(0, MAX_PLAYERS) };
}

/** Accepts anything (old or hand-edited storage) and returns a valid Follows. */
export function parseFollows(raw: string | null): Follows {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<Follows>;
    const leagues = Array.isArray(data.leagues)
      ? data.leagues.filter((l): l is FollowedLeague => typeof l?.slug === "string" && typeof l?.name === "string")
      : [];
    const players = Array.isArray(data.players)
      ? data.players.filter(
          (p): p is FollowedPlayer =>
            typeof p?.slug === "string" && typeof p?.playerId === "string" && typeof p?.name === "string",
        )
      : [];
    return { leagues: leagues.slice(0, MAX_LEAGUES), players: players.slice(0, MAX_PLAYERS) };
  } catch {
    return EMPTY;
  }
}

// ─── Browser storage ─────────────────────────────────────────────────────────

const KEY = "sports-tracker:follows";
const CHANGE_EVENT = "sports-tracker:follows-changed";

export function readFollows(): Follows {
  try {
    return parseFollows(window.localStorage.getItem(KEY));
  } catch {
    return EMPTY;
  }
}

export function writeFollows(follows: Follows) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(follows));
  } catch {
    // Storage blocked: following just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For useSyncExternalStore: notify on changes from this tab and from other tabs. */
export function subscribeFollows(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Raw string snapshot (stable between calls, as useSyncExternalStore requires). */
export function followsSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
