# Plan

How Sports Tracker gets built, milestone by milestone. The brief is in `CLAUDE.md`,
the reasons behind choices are in `docs/DECISIONS.md`, and the current status is in
`docs/PROGRESS.md`.

## Product in one paragraph

A soccer league tracker for rec and pickup groups. Someone creates a league without an
account and gets two links: a **public link** to share with everyone and a **secret admin
link** to keep. With the admin link they add teams and players and record matches (goals
with scorer and assist). Everyone with the public link sees standings, player stats,
results and live scores on their phone.

## Architecture (target)

```
Browser ──> Next.js App Router (Vercel)
              ├─ Server Components: read pages (standings, stats, matches)
              ├─ Server Actions: every write (admin only, checked by admin token)
              ├─ Route handler: GET live match state (polled by the live page)
              └─ opengraph-image: score-card PNG for chat link previews
                     │
                     └─ Prisma 7 (pg driver adapter) ──> Postgres (Docker locally, Neon in prod)
```

Code layout:

| Folder | What lives there |
|---|---|
| `src/app/` | Routes: pages, layouts, server actions, route handlers |
| `src/components/` | Reusable UI components |
| `src/domain/` | Pure functions with no I/O: standings, player stats, scores. Fully unit-tested. |
| `src/server/` | Database reads and writes (queries, admin auth check) |
| `src/lib/` | Small helpers: db client, tokens, formatting |
| `prisma/` | Schema, migrations, demo seed |
| `e2e/` | Playwright suite (M5) |

The rule that keeps it learnable: **calculations live in `src/domain` as pure functions**
(input: plain data, output: plain data). Database code fetches rows and hands them to
those functions. So every number on the standings page can be tested without a database.

## URLs

| URL | Who | What |
|---|---|---|
| `/` | everyone | What it is + "Create a league" |
| `/new` | everyone | Create-league form |
| `/l/<slug>` | everyone | League home: live matches, standings, recent results, top scorers |
| `/l/<slug>/matches` | everyone | All matches |
| `/l/<slug>/matches/<id>` | everyone | One match, live-updating while in progress |
| `/l/<slug>/players` | everyone | Player stats |
| `/a/<token>` | admin | Manage teams, players, matches |
| `/a/<token>/matches/<id>` | admin | Record / live-log a match |

## Milestones

The checklist below is the original plan. Current status lives in `docs/PROGRESS.md`.

### M1 Foundation
- [x] Remove Firebase Studio leftovers, rename package
- [x] ESLint (flat config), typecheck script, Vitest
- [x] GitHub Actions CI: lint, typecheck, unit tests, migrations + seed, build
- [x] Postgres in Docker, Prisma 7, data model, first migration
- [x] Demo seed
- [x] docs: PLAN, PROGRESS, DECISIONS; README local setup

### M2 Core flows
1. Domain functions + tests: match score from events, standings with tiebreakers, player stats
2. Create league (no signup) → "save your links" page
3. Admin auth: resolve league from admin token (hash lookup); every action re-checks it
4. Admin: teams and players (add, rename, delete with guard rails)
5. Admin: matches (schedule, record result with goal + assist events, edit, delete)
6. Public league pages: standings, results, player stats
7. Replace placeholder pages (home, about, contact, login, matches-table) and header/footer

### M3 Live match mode
1. Match status flow: scheduled → live → finished
2. Admin live console: big "+ goal" buttons per team, pick scorer/assist, undo
3. Public match page polls for changes every few seconds while live
4. Score-card image (`opengraph-image`) for match links

### M4 Ship it
Mobile-first polish, empty/loading/error states, accessibility pass, Vercel + Neon deploy
(account steps for the owner), README with live link and screenshots.

### M5 End-to-end tests
Playwright + page objects: create league, record match, standings update, live view.
Runs in CI against a Postgres service.

### M6 Learning pack
`docs/ARCHITECTURE.md`, `docs/WALKTHROUGH.md`, `docs/QUIZ.md`.

### M7 Stretch (in order, if time allows)
Player profiles + personal feed; stat charts over time; CSV import/export; PWA;
LLM match recaps (only when an API key is set).
