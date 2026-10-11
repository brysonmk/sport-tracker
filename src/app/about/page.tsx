import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "What Sports Tracker is and how it works.",
};

export default function About() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 leading-relaxed">
      <h1 className="text-2xl font-bold">About Sports Tracker</h1>
      <p>
        Sports Tracker keeps the league table, the top scorers and live scores for a rec or pickup soccer group, so
        nobody has to maintain a spreadsheet or answer &ldquo;what&apos;s the score?&rdquo; in the group chat.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">No accounts: links instead</h2>
        <p>
          Creating a league gives you two links. The <strong>public link</strong> is read-only; share it with everyone.
          The <strong>admin link</strong> lets whoever holds it add teams and record matches. Treat it like a password.
          Only a hashed version of it is stored, so it can&apos;t be recovered if lost.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">How the table is worked out</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>A win is worth 3 points, a draw 1, a loss 0.</li>
          <li>Teams level on points are split by goal difference, then goals scored, then their head-to-head results.</li>
          <li>Teams that are still level share the position.</li>
          <li>Only finished matches count, so a live score never moves the table until the final whistle.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Open source</h2>
        <p>
          The code is on{" "}
          <a href="https://github.com/brysonmk/sport-tracker" className="text-accent underline">
            GitHub
          </a>
          . Questions or ideas? See the <Link href="/contact" className="text-accent underline">contact page</Link>.
        </p>
      </section>
    </article>
  );
}
