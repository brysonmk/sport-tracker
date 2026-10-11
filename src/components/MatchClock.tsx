"use client";

import { useEffect, useState } from "react";
import { elapsedMinute } from "@/domain/matchClock";

/** "23'" for a live match, ticking in the browser. Renders nothing until mounted. */
export function MatchClock({ startedAt }: { startedAt: Date | string }) {
  const [minute, setMinute] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(startedAt);
    const tick = () => setMinute(elapsedMinute(start, new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (minute === null) return null;
  return (
    <span className="tabular font-semibold text-live" aria-label={`Minute ${minute}`}>
      {minute}&apos;
    </span>
  );
}
