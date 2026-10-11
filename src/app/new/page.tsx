import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { CreateLeagueForm } from "./CreateLeagueForm";

export const metadata: Metadata = {
  title: "Create a league",
  description: "Create a soccer league in seconds. No account needed.",
};

export default function NewLeaguePage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold">Create a league</h1>
      <p className="mb-6 text-muted">
        No account needed. You&apos;ll get a public link to share and a private admin link to keep.
      </p>
      <Card>
        <CreateLeagueForm />
      </Card>
    </div>
  );
}
