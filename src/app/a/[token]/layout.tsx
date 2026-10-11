import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NavTabs } from "@/components/NavTabs";
import { findLeagueByAdminToken } from "@/server/leagues";

// Admin pages must never show up in search results.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AdminLayout({ params, children }: LayoutProps<"/a/[token]">) {
  const { token } = await params;
  const league = await findLeagueByAdminToken(token);
  if (!league) notFound();

  const base = `/a/${token}`;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Admin</p>
          <h1 className="text-2xl font-bold">{league.name}</h1>
        </div>
        <Link href={`/l/${league.slug}`} className="text-sm text-muted underline hover:text-fg">
          View public page
        </Link>
      </div>
      <NavTabs
        label="Admin sections"
        tabs={[
          { href: base, label: "Matches", prefixes: [`${base}/matches`] },
          { href: `${base}/teams`, label: "Teams & players" },
          { href: `${base}/settings`, label: "Links & settings" },
        ]}
      />
      {children}
    </div>
  );
}
