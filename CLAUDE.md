# Sports Tracker: project brief

This is the owner's brief for this repo, saved verbatim so every session loads it.
Start every session by reading `docs/PROGRESS.md`, then `docs/DECISIONS.md`.

---

You're building out my side project, Sports Tracker, in this repo (github.com/brysonmk/sport-tracker). Work as autonomously as you can. I'll review and learn the whole codebase at the end, so build it to be easy to learn.

About me: QA engineer, strong in TypeScript, Playwright, React/Node and Python. I already know Postgres + Prisma, so prefer those.

Current state: a Next.js 16 / React 19 / Tailwind 4 skeleton from Firebase Studio. The pages (home, about, contact, login, matches-table) are placeholders. Keep my existing commits.

Product: a tracker for rec and pickup sports groups. A group creates a league without signing up, records matches (score, scorers, assists), and everyone gets automatic standings, player stats and live scores on their phone. Depth over breadth: a polished, working core beats many half-built features.

FIRST: in your first commit, save this brief as CLAUDE.md at the repo root so every later session loads it. Then ask me these three questions once, each with your recommended default, record my answers in docs/DECISIONS.md, and never ask them again:
1. Which sport? (default: soccer)
2. Is there a real group that could use it? (default: my pickup soccer group)
3. Will I create Vercel and Neon accounts when you need them? (default: yes)
After that, don't ask me questions. Make reasonable decisions and log each one with its reason in docs/DECISIONS.md. Stop only for things you can't do yourself (creating accounts, secrets, payments): give me exact steps, and I'll put secrets in .env myself. Never ask me to paste a secret into chat.

RULES
- Small commits. Every commit builds and passes lint, typecheck and tests. Commit after each small step so a sudden stop never loses work.
- One branch and PR per milestone; merge into main once CI is green.
- Work only inside this repo folder. Never commit secrets: .env stays gitignored, and .env.example documents every variable.
- The README gets a short "How it was built" section.
- Never invent users, testimonials or metrics. Label all seed data as demo data.
- Next.js 16 and React 19 may differ from what you remember. Check the installed versions' docs and types before using an API.
- Keep docs/PROGRESS.md current (done, in progress, next). Each new session starts by reading it.

MILESTONES (in order; finish each before starting the next)
M1 Foundation: remove the Firebase Studio leftovers (.idx/, GEMINI.md) and rename the package from "out"; Postgres in Docker for local dev, plus Prisma; data model (League, Team, Player, Match, MatchEvent); a seed script with a demo league; ESLint, Vitest and GitHub Actions CI (lint, typecheck, unit tests); docs/PLAN.md.
M2 Core flows: create a league with no signup (public link + secret admin link); manage teams and players; record matches with goal and assist events; standings (W/D/L, points, goal difference, tiebreakers) and player stats, with unit tests for every calculation; replace the placeholder pages.
M3 Live match mode: the admin logs events during a game, and the public page updates within a few seconds without a refresh (choose the simplest approach that works on Vercel and explain it in DECISIONS.md). Match links show a score-card image when pasted into a chat.
M4 Ship it: mobile-first polish, empty/loading/error states and basic accessibility; deploy to Vercel with Neon Postgres (give me the account steps); a README with the live link, screenshots or a GIF, and local setup.
M5 End-to-end tests: a Playwright suite using page objects for the main flows (create a league, record a match, standings update, live view), running in CI. Structure it well; this is my specialty and I'll extend it myself.
M6 Learning pack (do this before any stretch goal):
- docs/ARCHITECTURE.md: a Mermaid diagram of the main data flow and why it's built this way.
- docs/WALKTHROUGH.md: the files in the order I should read them, then one action traced end to end (record a goal → database → standings → live page) with file:line references.
- docs/QUIZ.md: 15 questions that test whether I understand the code and the decisions, with all the answers in a separate section at the bottom.
M7 Stretch, in this order, only if time is left: player profiles and a personal feed on the home page; charts of player stats over time; CSV import/export; an installable PWA; LLM match recaps generated from match events (only when an API key is set; hidden otherwise).
