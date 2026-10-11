import { notFound } from "next/navigation";
import { LiveUpdates } from "@/components/LiveUpdates";
import { NavTabs } from "@/components/NavTabs";
import { RememberLeague } from "@/components/RememberLeague";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueVersion } from "@/server/leagueVersion";
import { getLeagueSnapshot } from "@/server/snapshot";

/** Poll fast while a match is live, slowly otherwise (to notice a match starting). */
const LIVE_POLL_MS = 3_000;
const IDLE_POLL_MS = 30_000;

export async function generateMetadata({ params }: LayoutProps<"/l/[slug]">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  return league
    ? { title: { default: league.name, template: `%s · ${league.name}` }, description: `Standings, results and player stats for ${league.name}.` }
    : {};
}

export default async function LeagueLayout({ params, children }: LayoutProps<"/l/[slug]">) {
  const { slug } = await params;
  const league = await findLeagueBySlug(slug);
  if (!league) notFound();

  const [version, { matches }] = await Promise.all([getLeagueVersion(league.id), getLeagueSnapshot(league.id)]);
  const anyLive = matches.some((m) => m.status === "LIVE");

  const base = `/l/${slug}`;
  return (
    <div>
      <LiveUpdates slug={slug} version={version} intervalMs={anyLive ? LIVE_POLL_MS : IDLE_POLL_MS} />
      <RememberLeague slug={slug} name={league.name} />
      <h1 className="mb-4 text-2xl font-bold">{league.name}</h1>
      <NavTabs
        label="League sections"
        tabs={[
          { href: base, label: "Table" },
          { href: `${base}/matches`, label: "Matches", prefixes: [`${base}/matches`] },
          { href: `${base}/players`, label: "Players", prefixes: [`${base}/players`] },
        ]}
      />
      {children}
    </div>
  );
}
