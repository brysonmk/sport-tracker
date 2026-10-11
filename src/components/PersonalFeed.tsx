"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetLeague, readFollows, writeFollows } from "@/lib/follows";
import type { Feed, FeedMatch } from "@/server/feed";
import { Card } from "./ui/Card";
import { LocalTime } from "./ui/LocalTime";
import { useFollows } from "./useFollows";

const REFRESH_MS = 30_000;

/**
 * "Your leagues" and "Players you follow" on the home page, for this device.
 * Renders nothing for a first-time visitor. Refreshes every 30 s while visible, so live
 * scores move on the home page too.
 */
export function PersonalFeed() {
  const follows = useFollows();
  const [feed, setFeed] = useState<Feed | null>(null);

  const leagueParam = follows.leagues.map((l) => l.slug).join(",");
  const playerParam = follows.players.map((p) => p.playerId).join(",");

  useEffect(() => {
    if (!leagueParam) return;
    let cancelled = false;
    // The first load always runs; the 30 s refreshes skip hidden tabs.
    async function load(force = false) {
      if (!force && document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`/api/feed?leagues=${leagueParam}&players=${playerParam}`, { cache: "no-store" });
        if (res.ok && !cancelled) setFeed(await res.json());
      } catch {
        // Offline: keep showing the last feed.
      }
    }
    load(true);
    const id = setInterval(() => load(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [leagueParam, playerParam]);

  if (follows.leagues.length === 0) return null;

  const adminTokenFor = (slug: string) => follows.leagues.find((l) => l.slug === slug)?.adminToken;

  return (
    <section aria-labelledby="your-leagues" className="mb-10">
      <h2 id="your-leagues" className="mb-3 text-xl font-semibold">
        Your leagues
      </h2>
      {!feed ? (
        <p className="text-sm text-muted" role="status">
          Loading…
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {follows.leagues.map((followed) => {
            const league = feed.leagues.find((l) => l.slug === followed.slug);
            const adminToken = adminTokenFor(followed.slug);
            return (
              <li key={followed.slug}>
                <Card>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <Link href={`/l/${followed.slug}`} className="font-semibold hover:text-accent">
                      {league?.name ?? followed.name}
                    </Link>
                    {adminToken && (
                      <Link href={`/a/${adminToken}`} className="text-sm text-accent">
                        Admin
                      </Link>
                    )}
                  </div>
                  {!league ? (
                    <p className="text-sm text-muted">
                      This league no longer exists.{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => writeFollows(forgetLeague(readFollows(), followed.slug))}
                      >
                        Remove it
                      </button>
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 text-sm">
                      {league.live.map((m) => (
                        <MatchLine key={m.id} match={m} slug={league.slug} label="Live" />
                      ))}
                      {league.latest && <MatchLine match={league.latest} slug={league.slug} label="Latest" />}
                      {league.next && <MatchLine match={league.next} slug={league.slug} label="Next" />}
                      {league.leader && (
                        <p className="text-muted">
                          Top of the table: <span className="font-medium text-fg">{league.leader.teamName}</span> (
                          {league.leader.points} {league.leader.points === 1 ? "pt" : "pts"})
                        </p>
                      )}
                      {!league.live.length && !league.latest && !league.next && (
                        <p className="text-muted">No matches yet.</p>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {feed && feed.players.length > 0 && (
        <>
          <h2 className="mb-3 mt-6 text-xl font-semibold">Players you follow</h2>
          <ul className="flex flex-col gap-2">
            {feed.players.map((p) => (
              <li key={p.playerId}>
                <Link
                  href={`/l/${p.slug}/players/${p.playerId}`}
                  className="block rounded-xl border border-line bg-card px-4 py-3 hover:border-accent"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{p.name}</span>
                    <span className="tabular text-sm">
                      {p.goals} G · {p.assists} A
                    </span>
                  </span>
                  {p.lastInvolvement && (
                    <span className="block truncate text-xs text-muted">
                      Last: {p.lastInvolvement.label}, <LocalTime date={p.lastInvolvement.date} format="date" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function MatchLine({ match, slug, label }: { match: FeedMatch; slug: string; label: "Live" | "Latest" | "Next" }) {
  return (
    <Link href={`/l/${slug}/matches/${match.id}`} className="flex items-baseline gap-2 hover:text-accent">
      <span className={`w-12 shrink-0 text-xs font-semibold uppercase ${label === "Live" ? "text-live" : "text-muted"}`}>
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {match.status === "SCHEDULED"
          ? `${match.home} vs ${match.away}`
          : `${match.home} ${match.score.home}–${match.score.away} ${match.away}`}
      </span>
      {match.status === "SCHEDULED" && match.when && (
        <span className="shrink-0 text-xs text-muted">
          <LocalTime date={match.when} format="date" />
        </span>
      )}
    </Link>
  );
}
