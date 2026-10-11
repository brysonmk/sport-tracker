import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OpenLeagueForm } from "./OpenLeagueForm";

export const metadata: Metadata = { title: "Open a league" };

export default function OpenLeaguePage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold">Open a league</h1>
      <p className="mb-6 text-muted">
        There are no accounts. Your link is your access: paste the public link to view a league, or the admin link to
        manage it.
      </p>
      <Card>
        <OpenLeagueForm />
      </Card>
      <p className="mt-6 text-sm text-muted">
        Lost your admin link? It can&apos;t be recovered, because only a scrambled (hashed) version of it is stored.
        You can <Link href="/new" className="text-accent underline">create a new league</Link>.
      </p>
    </div>
  );
}
