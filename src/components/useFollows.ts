"use client";

import { useMemo, useSyncExternalStore } from "react";
import { followsSnapshot, parseFollows, subscribeFollows, type Follows } from "@/lib/follows";

/**
 * The leagues and players this device follows. Re-renders when they change, in this
 * tab or another. On the server (and during hydration) it's empty: the server can't see
 * localStorage.
 */
export function useFollows(): Follows {
  const raw = useSyncExternalStore(subscribeFollows, followsSnapshot, () => "");
  return useMemo(() => parseFollows(raw || null), [raw]);
}
