"use client";

import { useEffect } from "react";
import { readFollows, rememberLeague, writeFollows } from "@/lib/follows";

/**
 * Adds the league being viewed to "Your leagues" on this device (home page feed).
 * Rendered by the public and admin league layouts; draws nothing.
 */
export function RememberLeague({ slug, name, adminToken }: { slug: string; name: string; adminToken?: string }) {
  useEffect(() => {
    writeFollows(rememberLeague(readFollows(), { slug, name, adminToken }));
  }, [slug, name, adminToken]);
  return null;
}
