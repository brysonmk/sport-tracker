import type { MatchView } from "@/server/snapshot";
import { LocalTime } from "./ui/LocalTime";
import { StatusBadge } from "./StatusBadge";

/** The big score at the top of a match page. */
export function Scoreboard({ match }: { match: MatchView }) {
  const played = match.status !== "SCHEDULED";
  const when = match.kickoffAt ?? match.startedAt;
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-5 text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-sm text-muted">
        <StatusBadge status={match.status} />
        {when && <LocalTime date={when} />}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <h2 className="text-lg font-semibold leading-tight">{match.home.name}</h2>
        <p className="tabular text-4xl font-bold" aria-label={played ? `Score ${match.score.home} to ${match.score.away}` : "Not started"}>
          {played ? `${match.score.home} – ${match.score.away}` : "vs"}
        </p>
        <h2 className="text-lg font-semibold leading-tight">{match.away.name}</h2>
      </div>
    </div>
  );
}
