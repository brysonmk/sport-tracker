# Walkthrough

How to learn this codebase: read the files in the order below (each builds on the one
before), then follow one goal from the organiser's tap to the spectator's screen.
Line numbers were last checked in M7; if they've drifted, search for the quoted code.

## Part 1: reading order

### 1. The shape of the data (15 min)

1. [prisma/schema.prisma](../prisma/schema.prisma): the five models. Note that `Match`
   has no score columns, and `MatchEvent` is one row per goal with an optional scorer and
   assist (line 103). Read the comments on the relations; they explain the delete rules.
2. [src/domain/types.ts](../src/domain/types.ts): the smaller shapes the calculation
   functions accept.

### 2. The rules, without any framework (30 min)

Read each file with its `.test.ts` next to it. The tests are the spec.

3. [src/domain/score.ts](../src/domain/score.ts): score = count of goal events.
4. [src/domain/standings.ts](../src/domain/standings.ts): the league table. Start at
   `computeStandings` (line 37), then `tally` (74), `record` (90), `compareTallies` (104).
   Then reread lines 44–68 for the head-to-head mini-table and shared positions.
5. [src/domain/playerStats.ts](../src/domain/playerStats.ts),
   [matchStatus.ts](../src/domain/matchStatus.ts) (the allowed status changes),
   [matchClock.ts](../src/domain/matchClock.ts), [matchList.ts](../src/domain/matchList.ts).

### 3. Talking to the database (20 min)

6. [src/lib/db.ts](../src/lib/db.ts): the one Prisma client, and why it's cached on
   `globalThis` in development.
7. [src/lib/tokens.ts](../src/lib/tokens.ts): admin token, its hash, the public slug.
8. [src/server/leagues.ts](../src/server/leagues.ts): create a league; find one by slug or
   by admin token.
9. [src/server/snapshot.ts](../src/server/snapshot.ts): the most important server file.
   Three queries load a league, `toMatchView` shapes each match, then the domain functions
   compute the table and stats (lines 67–96).

### 4. Reading pages (20 min)

10. [src/app/layout.tsx](../src/app/layout.tsx): root layout, metadata, skip link.
11. [src/app/l/[slug]/layout.tsx](../src/app/l/[slug]/layout.tsx): the public league
    shell: title, tabs, and `<LiveUpdates>`.
12. [src/app/l/[slug]/page.tsx](../src/app/l/[slug]/page.tsx): the table page. Notice it's
    an `async` component that awaits data and renders HTML on the server; there's no
    `useEffect` fetching.
13. [src/components/StandingsTable.tsx](../src/components/StandingsTable.tsx),
    [Scoreboard.tsx](../src/components/Scoreboard.tsx),
    [MatchCard.tsx](../src/components/MatchCard.tsx): server components that just render.

### 5. Writing data (30 min)

14. [src/server/schemas.ts](../src/server/schemas.ts): zod validation for every form.
15. [src/lib/formState.ts](../src/lib/formState.ts): what an action returns to its form.
16. [src/server/admin.ts](../src/server/admin.ts): `requireAdminLeague`, the guard every
    write goes through.
17. [src/app/a/[token]/actions.ts](../src/app/a/[token]/actions.ts): all admin writes.
    Read the header comment, then `addTeam`, then `addGoal` (line 242).
18. [src/app/a/[token]/_components/GoalForm.tsx](../src/app/a/[token]/_components/GoalForm.tsx):
    a client form wired to a Server Action with `useActionState`.
19. [src/components/ui/Field.tsx](../src/components/ui/Field.tsx) and
    [SubmitButton.tsx](../src/components/ui/SubmitButton.tsx): labelled inputs with errors;
    a button that disables itself while the action runs.

### 6. Live mode (20 min)

20. [src/components/LiveUpdates.tsx](../src/components/LiveUpdates.tsx): the poller.
21. [src/app/api/leagues/[slug]/version/route.ts](../src/app/api/leagues/[slug]/version/route.ts)
    and [src/server/leagueVersion.ts](../src/server/leagueVersion.ts): what it polls.
22. [src/components/MatchClock.tsx](../src/components/MatchClock.tsx): the ticking minute.
23. [src/app/l/[slug]/matches/[matchId]/opengraph-image.tsx](../src/app/l/[slug]/matches/[matchId]/opengraph-image.tsx):
    the share card.

### 7. Tests and delivery (30 min)

24. [e2e/README.md](../e2e/README.md), then
    [e2e/support/fixtures.ts](../e2e/support/fixtures.ts) and one spec,
    [e2e/tests/live-view.spec.ts](../e2e/tests/live-view.spec.ts).
25. [.github/workflows/ci.yml](../.github/workflows/ci.yml),
    [prisma.config.ts](../prisma.config.ts), [docs/DEPLOY.md](DEPLOY.md).

## Part 2: one goal, traced end to end

Scenario: Lions vs Tigers is live. The organiser records "Goal for Lions, scorer Leo,
assist Lara, minute left empty". A spectator has the public match page open.

### Step 1: the form (organiser's phone)

- The admin match page renders the goal form with the token and match id:
  `src/app/a/[token]/matches/[matchId]/page.tsx:62`.
- `GoalForm` binds the Server Action to those two values and hands it to React:
  `src/app/a/[token]/_components/GoalForm.tsx:33`
  `useActionState(addGoal.bind(null, token, matchId), initialFormState)`.
- The `<form action={formAction}>` (line 58) posts its fields (`teamId` radio at line 69,
  `scorerId`, `assistId`, `minute`) when submitted. React sends them to the server as a
  POST to the current URL; no fetch code is written by hand.

### Step 2: the Server Action (server)

`src/app/a/[token]/actions.ts`, `addGoal` (line 242):

1. **Who is this?** Line 243: `requireAdminLeague(token)` → `src/server/admin.ts:13` →
   `findLeagueByAdminToken` (`src/server/leagues.ts:40`) looks the league up by
   `hashAdminToken(token)` (`src/lib/tokens.ts:18`). Wrong token → throws, nothing written.
2. **Is the input valid?** Lines 244–246: `formToObject` turns FormData into strings,
   `goalSchema` (`src/server/schemas.ts:54`) parses it. An empty minute becomes `null`;
   "scorer = assister" is rejected (`schemas.ts:73`). On failure the action returns field
   errors and the typed values, and the form shows them.
3. **Does it belong to this league?** Lines 249–256: the match must be in this league
   (`where: { id: matchId, leagueId: league.id }`), the team must be one of its two
   teams, and the players must be in the league. Ids sent by a tampered form can't reach
   another league's data.
4. **Fill in the minute.** Line 260: the minute was empty and the match is live, so
   `elapsedMinute(match.startedAt, now)` (`src/domain/matchClock.ts:6`) gives the
   current match minute.
5. **Write.** Lines 264–267, one transaction:
   - `db.matchEvent.create(...)` inserts the goal row (model at `prisma/schema.prisma:103`).
   - `db.match.update(... updatedAt: now)` bumps the match's `updatedAt`
     (`schema.prisma:88`). This is what the spectator's page will notice.
6. **Refresh the organiser's page.** Line 268: `revalidateLeague` →
   `src/server/admin.ts:20–22` calls `revalidatePath` for the admin and public layouts, so
   the action's response carries the re-rendered admin page with the new goal and score.

### Step 3: the database

One new `MatchEvent` row (`teamId` = Lions, `scorerId` = Leo, `assistId` = Lara, `minute`)
and the `Match` row's `updatedAt` moved forward. Nothing else changes: no score column,
no standings table. Everything else is computed when read.

### Step 4: the spectator's page notices (spectator's phone)

- The public league layout rendered `<LiveUpdates slug version intervalMs>` with the
  version at render time and a 3 s interval because a match is live:
  `src/app/l/[slug]/layout.tsx:26` (load version + snapshot), `:27` (`anyLive`), `:32`.
- In the browser, `LiveUpdates` runs `check()` every 3 s
  (`src/components/LiveUpdates.tsx:29`): it fetches `/api/leagues/<slug>/version`
  (line 33).
- The route handler (`src/app/api/leagues/[slug]/version/route.ts:11`) calls
  `getLeagueVersion` (`src/server/leagueVersion.ts:12`): one aggregate query, returned as
  `"<match count>-<newest updatedAt in ms>"` (line 18). Because step 2.5 bumped
  `updatedAt`, the string is new.
- Line 36: the version differs from the rendered one → `router.refresh()`.

### Step 5: re-render with the new standings and score (server → spectator)

- `router.refresh()` asks Next.js to re-render the current route's server components
  (layout and page) and stream the result back. The browser swaps it in without a page
  reload; scroll position and client state stay.
- The page loads the snapshot: `getLeagueSnapshot` (`src/server/snapshot.ts:96`) →
  `loadLeagueSnapshot` (line 67) runs three queries, including matches with their goals
  (line 75).
- Each match row becomes a `MatchView` (line 78, `toMatchView` at 98); its score is
  `scoreOf` over the goal events (line 122 → `src/domain/score.ts:9`). The new goal
  makes it Lions 1 – 0 Tigers.
- `computeStandings(teams, matches)` (line 89 → `src/domain/standings.ts:37`) runs too.
  It keeps only FINISHED matches (`standings.ts:38`), so a live goal doesn't move the
  table yet. When the organiser later taps *Finish match*, `changeMatchStatus`
  (`actions.ts:227`) checks the transition (`statusChange`, line 232 →
  `src/domain/matchStatus.ts:12`), updates the row (bumping `updatedAt` again), and the
  same poll → refresh path puts this match into the table: `tally` (74) and `record` (90)
  add the win, `compareTallies` (104) orders the table, and head-to-head (52) splits ties.
- `computePlayerStats` (`snapshot.ts:90` → `src/domain/playerStats.ts:19`) follows the
  same finished-only rule, so Leo's goal and Lara's assist count from the final whistle.

### Step 6: what the spectator sees

- The match page renders `<Scoreboard>` (`src/app/l/[slug]/matches/[matchId]/page.tsx:37`):
  the score is `aria-live="polite"` while live (`src/components/Scoreboard.tsx:21`), so a
  screen reader announces "Score 1 to 0".
- The goal list shows the minute, "⚽ Leo" and "Assist: Lara" on the Lions (left) side.
- On the table page, `StandingsTable` (`src/app/l/[slug]/page.tsx:34`) shows the new
  rows after the match is finished.

Total delay from tap to spectator: the action's round trip plus up to one poll interval,
about 3 s worst case. The Playwright spec `e2e/tests/live-view.spec.ts` checks this whole
path, including that the page was updated in place rather than reloaded.
