/** Grey placeholder blocks shown while a page loads (see the loading.tsx files). */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-line/60 ${className}`} />;
}

/** Page body placeholder. The league/admin layout (title and tabs) is already shown above it. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <SkeletonBlock className="mb-3 h-6 w-32" />
      <SkeletonBlock className="mb-6 h-56 w-full" />
      <SkeletonBlock className="mb-3 h-6 w-40" />
      <SkeletonBlock className="mb-2 h-20 w-full" />
      <SkeletonBlock className="h-20 w-full" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
