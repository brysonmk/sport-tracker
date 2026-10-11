import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Report a bug or suggest a feature.",
};

export default function Contact() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 leading-relaxed">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p>
        Found a bug or have an idea? Open an issue on GitHub. Please don&apos;t paste your admin link into an issue:
        anyone who sees it could edit your league.
      </p>
      <p>
        <a
          href="https://github.com/brysonmk/sport-tracker/issues/new"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 font-medium text-accent-fg"
        >
          Open an issue on GitHub
        </a>
      </p>
    </article>
  );
}
