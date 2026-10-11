import { PageSkeleton } from "@/components/Skeleton";

// Shown instantly while the server renders the page (Next.js wraps the page in Suspense).
export default function Loading() {
  return <PageSkeleton />;
}
