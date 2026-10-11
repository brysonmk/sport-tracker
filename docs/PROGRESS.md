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

- M3 Live match mode (PR #3): public league pages poll a version endpoint and refresh
  in place (checked by hand: a goal saved in the admin tab showed on the public tab
  2.7 s later without a reload); live match clock; empty goal minute = now while live;
  score-card share image for match links.

## In progress
- M3: waiting for CI, then merge.

## Next
- M4 Ship it: mobile polish, loading/empty/error states, accessibility pass, deploy to
  Vercel + Neon (owner creates accounts), README with live link and screenshots.

## Known gaps (to handle in M4 polish)
- Loading states (`loading.tsx`) for league pages.
- Edit forms in lists have generic labels ("Name"); make them unique for screen readers.
