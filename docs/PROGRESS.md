# Progress

Read this first in every session. Updated after each step.

## Done
- **M1 Foundation** (PR #1): Firebase leftovers removed, package renamed, Next 16.4 /
  React 19.3, ESLint + typecheck + Vitest, CI, Postgres in Docker, Prisma 7 data model,
  demo seed, docs/PLAN.md.
- **M2 Core flows** (PR #2): league with no signup (public + admin link), teams, players,
  matches, goals and status; public table/matches/match/players pages; standings with
  tiebreakers and player stats (unit-tested); placeholder pages replaced.
- **M3 Live match mode** (PR #3): public pages poll a version endpoint and refresh in
  place (~3 s while live); live clock; auto goal minute; score-card share image.
- **M4 Ship it, except the deploy** (PR #4): loading states, accessibility pass, security
  headers, migrations in the Vercel build, docs/DEPLOY.md, README with screenshots.
- **M5 End-to-end tests** (PR #5): Playwright + page objects + fixtures, mobile and
  desktop, console-error guard, in CI against a production build.
- **M6 Learning pack** (PR #6): ARCHITECTURE.md, WALKTHROUGH.md, QUIZ.md.
- **M7 Stretch** (PR #7), all five items:
  1. Player profiles and a personal feed (this device's leagues and followed players).
  2. Over-time charts: player goals/assists, top-3 scoring race.
  3. CSV: four formula-safe downloads; roster import.
  4. Installable PWA: manifest, icons, offline-page service worker (Chrome
     installability check: no errors).
  5. AI match recaps, only with `ANTHROPIC_API_KEY`. Not yet run against the real API
     (no key on this machine); response handling unit-tested with a stub client.
  Tests at the end of M7: 143 unit, 28 e2e (14 tests × mobile + desktop).
  WALKTHROUGH/QUIZ line references re-checked after M7's changes.

## Waiting on the owner
- **Deploy**: create the Vercel + Neon accounts with docs/DEPLOY.md (about 5 minutes),
  then share the production URL. Then: README live link + check the deployed app.
- **Optional**: an Anthropic API key in Vercel/.env to turn on recaps (docs/DEPLOY.md).

## In progress
- Nothing. All milestones in the brief are done except the deploy above.

## Next
- After the deploy: add the live link to the README, re-take screenshots from production
  data if useful, run one real recap.
- Whatever the owner asks for after reviewing.
