import Link from "next/link";
import type { MatchView } from "@/server/snapshot";
import { MatchClock } from "./MatchClock";
import { LocalTime } from "./ui/LocalTime";
import { StatusBadge } from "./StatusBadge";

/** One match as a tappable row: Home 2 – 1 Away, with its status or kickoff time. */
export function MatchCard({ match, href }: { match: MatchView; href: string }) {
  const played = match.status !== "SCHEDULED";
  const when = match.kickoffAt ?? match.startedAt;
  return (
    <Link
      href={href}
      className="block rounded-xl border border-line bg-card px-4 py-3 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <StatusBadge status={match.status} />
        {match.status === "LIVE" && match.startedAt ? <MatchClock startedAt={match.startedAt} /> : when && <LocalTime date={when} />}
      </div>
      {/* The visual row is hidden from screen readers; they get the sentence below. */}
      <div aria-hidden className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="truncate font-medium">{match.home.name}</span>
        <span className="tabular min-w-14 text-center text-lg font-bold">
          {played ? `${match.score.home} – ${match.score.away}` : "vs"}
        </span>
        <span className="truncate text-right font-medium">{match.away.name}</span>
      </div>
      <span className="sr-only">
        {played
          ? `${match.home.name} ${match.score.home}, ${match.away.name} ${match.score.away}`
          : `${match.home.name} versus ${match.away.name}`}
      </span>
    </Link>
  );
}

export function MatchList({ matches, hrefFor }: { matches: MatchView[]; hrefFor: (m: MatchView) => string }) {
  return (
    <ul className="flex flex-col gap-2">
      {matches.map((m) => (
        <li key={m.id}>
          <MatchCard match={m} href={hrefFor(m)} />
        </li>
      ))}
    </ul>
  );
}
