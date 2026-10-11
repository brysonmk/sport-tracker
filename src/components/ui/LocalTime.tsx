"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Shows a date in the viewer's own timezone and language.
 *
 * The server doesn't know the viewer's timezone (Vercel runs in UTC), so the server
 * renders a neutral UTC date and the browser swaps in the local one after hydration.
 * useSyncExternalStore gives the server value during hydration and the client value
 * right after, without a hydration mismatch warning.
 */
export function LocalTime({ date, format = "datetime" }: { date: Date | string; format?: "datetime" | "date" | "time" }) {
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions =
    format === "date"
      ? { weekday: "short", month: "short", day: "numeric" }
      : format === "time"
        ? { hour: "numeric", minute: "2-digit" }
        : { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

  const text = useSyncExternalStore(
    subscribe,
    () => d.toLocaleString(undefined, options),
    () => d.toLocaleString("en-US", { ...options, timeZone: "UTC" }) + (format === "date" ? "" : " UTC"),
  );
  return <time dateTime={d.toISOString()}>{text}</time>;
}
