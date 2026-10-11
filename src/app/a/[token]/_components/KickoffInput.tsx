"use client";

import { useState } from "react";

/**
 * <input type="datetime-local"> gives "2026-10-11T18:30" with no timezone. The server
 * runs in UTC, so it would read that as 18:30 UTC. This converts it in the browser
 * (which knows the admin's timezone) to a full ISO time and sends that in a hidden
 * input called `kickoffAt`.
 */
export function KickoffInput({ id, describedBy }: { id: string; describedBy?: string }) {
  const [local, setLocal] = useState("");
  const iso = local ? new Date(local).toISOString() : "";
  return (
    <>
      <input
        id={id}
        type="datetime-local"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        aria-describedby={describedBy}
        className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
      />
      <input type="hidden" name="kickoffAt" value={iso} />
    </>
  );
}
