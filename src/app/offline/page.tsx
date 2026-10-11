import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline" };

/**
 * Shown by the service worker (public/sw.js) when a page can't load because the phone
 * has no connection. Static, so it can be cached ahead of time.
 */
export default function OfflinePage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="mx-auto mt-2 max-w-sm text-muted">
        Scores and tables need a connection. They&apos;ll be back as soon as you are.
      </p>
      <a
        href=""
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
      >
        Try again
      </a>
    </div>
  );
}
