"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Keeps a public league page up to date without a manual refresh.
 *
 * Every `intervalMs` it asks the server for the league's version (a tiny JSON
 * response). If that differs from the version this page was rendered with, it calls
 * router.refresh(): Next.js re-renders the server components and swaps in the new
 * HTML without a full page reload, keeping scroll position.
 *
 * It does nothing while the tab is hidden, and checks right away when it becomes
 * visible again (e.g. you unlock your phone).
 */
export function LiveUpdates({ slug, version, intervalMs }: { slug: string; version: string; intervalMs: number }) {
  const router = useRouter();
  // The latest rendered version. A ref, so a refresh doesn't restart the polling loop.
  const renderedVersion = useRef(version);
  useEffect(() => {
    renderedVersion.current = version;
  }, [version]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function check() {
      clearTimeout(timer);
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch(`/api/leagues/${slug}/version`, { cache: "no-store" });
          if (res.ok) {
            const data: { version: string } = await res.json();
            if (data.version !== renderedVersion.current) router.refresh();
          }
        } catch {
          // Offline or a blip: try again next tick.
        }
      }
      if (!stopped) timer = setTimeout(check, intervalMs);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") check();
    }

    timer = setTimeout(check, intervalMs);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slug, intervalMs, router]);

  return null;
}
