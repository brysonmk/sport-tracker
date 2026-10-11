import type { MatchStatus } from "@/domain/types";

export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-live">
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-live" />
        Live
      </span>
    );
  }
  if (status === "FINISHED") {
    return <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted" title="Full time">FT</span>;
  }
  return <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted">Upcoming</span>;
}
