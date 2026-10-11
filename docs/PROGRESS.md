# Progress

Read this first in every session. Updated after each step.

## Done
- M1 Foundation (PR #1, merged): Firebase leftovers removed, package renamed,
  Next 16.4 / React 19.3, ESLint + typecheck + Vitest, CI, Postgres in Docker,
  Prisma 7 data model + first migration, demo seed, docs/PLAN.md.
- M2 Core flows (PR #2, merged): create league with no signup (public + admin link), admin
  teams/players/matches/goals/status, public table/matches/match/players pages,
  standings with tiebreakers + player stats + match status rules (all unit-tested),
  placeholder pages replaced (home, about, contact, /open; /login and /matches-table
  redirect), 404 and error pages. Checked by hand in a phone-sized browser: create →
  teams → players → match → goals → finish → table and stats update.
- M3 Live match mode (PR #3, merged): public league pages poll a version endpoint and refresh
  in place (checked by hand: a goal saved in the admin tab showed on the public tab
  2.7 s later without a reload); live match clock; empty goal minute = now while live;
  score-card share image for match links.
- M4 Ship it (PR #4, merged), everything except the deploy itself: loading skeletons, skip link,
  unique labels, AA contrast, security headers, `vercel-build` with migrations,
  docs/DEPLOY.md, README with screenshots + share card + local setup.

## Waiting on the owner
- **Create the Vercel + Neon accounts**: follow docs/DEPLOY.md (about 5 minutes), then
  share the production URL. After that: add the live link to the README and check the
  deployed app (create league, live update, share image).

- M5 End-to-end tests (PR #5): Playwright suite with page objects and fixtures, 9 tests
  × 2 projects (mobile, desktop) covering create league, record match, standings
  update, live view; console-error guard; runs in CI against a production build.
  Locally 18/18 passed, and 54/54 with `--repeat-each=3`.

## In progress
- M6 Learning pack: ARCHITECTURE.md, WALKTHROUGH.md, QUIZ.md.

## Next
- M7 Stretch (in order, if time allows).
