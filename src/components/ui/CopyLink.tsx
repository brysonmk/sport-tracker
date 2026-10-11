"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "./Button";

const subscribe = () => () => {};

/**
 * A full link with Copy (and Share, on phones that support it) buttons.
 *
 * The server only knows the path. The browser adds its own origin, so the link is
 * right on localhost, on a Vercel preview and in production without configuration.
 */
export function CopyLink({ path, label }: { path: string; label: string }) {
  const url = useSyncExternalStore(
    subscribe,
    () => `${window.location.origin}${path}`,
    () => path,
  );
  const canShare = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the text is selectable anyway.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 font-mono text-sm"
      />
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={copy} className="flex-1 sm:flex-none">
          <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
        </Button>
        {canShare && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => navigator.share({ url }).catch(() => {})}
          >
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
