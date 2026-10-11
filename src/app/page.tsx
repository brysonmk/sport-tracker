import Link from "next/link";
import { connection } from "next/server";
import { PersonalFeed } from "@/components/PersonalFeed";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { findLeagueBySlug } from "@/server/leagues";

const STEPS = [
  {
    title: "Create a league",
    body: "Give it a name. No account, no email. You get a public link and a private admin link.",
  },
  {
    title: "Add teams and players",
    body: "Type them in once. Players can change teams later; old results stay correct.",
  },
  {
    title: "Record matches",
    body: "Log goals and assists live from the sideline, or enter the result afterwards.",
  },
  {
    title: "Everyone follows along",
    body: "The public link shows the table, top scorers and live scores on any phone.",
  },
];

export default async function Home() {
  // Render per request (not once at build time), because it reads the database.
  await connection();
  // The demo league exists only where the seed has been run.
  const demo = await findLeagueBySlug("demo-league");

  return (
    <div>
      {/* Leagues and players this device follows; empty for first-time visitors. */}
      <PersonalFeed />
      <section className="py-8 text-center sm:py-14">
        <h1 className="mx-auto max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
          Standings, scorers and live scores for your soccer league
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          For rec leagues and pickup groups. Set it up in a minute, share one link, and the table updates itself.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/new" className={buttonClasses("primary", "px-6")}>
            Create a league
          </Link>
          {demo && (
            <Link href={`/l/${demo.slug}`} className={buttonClasses("secondary", "px-6")}>
              See a demo league
            </Link>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">Free. No signup.</p>
      </section>

      <section aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="mb-4 text-xl font-semibold">
          How it works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full">
                <p className="mb-1 flex items-center gap-2 font-semibold">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-sm text-accent">
                    {i + 1}
                  </span>
                  {step.title}
                </p>
                <p className="text-sm text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
