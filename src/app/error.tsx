"use client";

import { Button } from "@/components/ui/Button";

/** Shown when a page or an action throws. `reset` re-renders the page. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-sm text-muted">
        {process.env.NODE_ENV === "development" ? error.message : "Please try again. If it keeps happening, reload the page."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
