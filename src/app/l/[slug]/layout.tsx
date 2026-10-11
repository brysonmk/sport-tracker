import { notFound } from "next/navigation";
import { NavTabs } from "@/components/NavTabs";
import { findLeagueBySlug } from "@/server/leagues";

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

  const base = `/l/${slug}`;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{league.name}</h1>
      <NavTabs
        label="League sections"
        tabs={[
          { href: base, label: "Table" },
          { href: `${base}/matches`, label: "Matches", prefixes: [`${base}/matches`] },
          { href: `${base}/players`, label: "Players" },
        ]}
      />
      {children}
    </div>
  );
}
