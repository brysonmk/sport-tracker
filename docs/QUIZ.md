# Quiz

Fifteen questions about the code and the decisions behind it. Try to answer each from
memory first, then check by reading the code, then read the answers at the bottom.

## Questions

1. Where is a match's score stored in the database? What would break, or get harder, if
   `Match` had `homeScore` and `awayScore` columns instead?

2. When a league is created, what exactly is saved about the admin token? Why is a plain
   SHA-256 hash acceptable here when it would be a bad choice for user passwords?

3. Someone with a valid admin link for league A edits the goal form's HTML so `teamId` is a
   team from league B, and submits. Walk through `addGoal`: which lines stop this, and what
   does the user see?

4. A match is LIVE and the score is 3–0. What do the league table and the player stats show
   for that match right now, and why was it built that way?

5. Aces, Bears and Comets each finish on 3 points, goal difference 0 and 1 goal scored,
   having each beaten one of the others 1–0 in a cycle. Trace `computeStandings`: which
   steps run, what are the final positions, and in what order are the teams listed?

6. The spectator's page refreshed after a goal was added. Name the two values the
   "version" string is made of. Which write in `addGoal` changes it, and which code path
   would silently stop live updates if that write were removed?

7. Why does live mode poll instead of using WebSockets or Server-Sent Events? What is the
   worst-case delay, and what does it cost per spectator?

8. What is the difference between what `router.refresh()` does in `LiveUpdates` and
   `window.location.reload()`? Why does it matter for this app?

9. The spectator locks their phone for 10 minutes during a match, then unlocks it. What
   does `LiveUpdates` do while locked and right after unlocking? Which lines?

10. Why can't the admin delete a team that has matches, at both the UI and the database
    level? Given that rule, how does the seed script manage to delete the old demo league?

11. A form submission fails validation. Why does the action send the typed values back
    (`FormState.values`), and why are some `<select>`s given a `key` based on those values?

12. The organiser adds a goal during a live match and leaves the minute empty. Where does
    the stored minute come from? What is stored if the match is still SCHEDULED?

13. `src/domain` never imports Prisma or Next.js. What does that buy you? Give a concrete
    example from the test files.

14. In the e2e suite, why do most tests create their data with `arrange` instead of
    through the UI? And what does the `failOnConsoleErrors` fixture catch that normal
    assertions don't? Give the real bug it found.

15. On Vercel, what runs during a deploy, in order? Why does the app use one database URL
    and migrations another?

---

## Answers

**1.** Nowhere. A goal is a `MatchEvent` row (`prisma/schema.prisma:99`) and the score is
counted from those rows by `scoreOf` (`src/domain/score.ts:9`), called in `toMatchView`
(`src/server/snapshot.ts:120`). With stored score columns, every goal add/delete would have
to update two places in step; if they ever disagreed, the scoreboard would say 2–1 while
the goal list and the player stats showed 1–1. Deriving the score keeps one source of
truth (docs/DECISIONS.md, M1).

**2.** Only `adminTokenHash`, the SHA-256 of the token (`src/lib/tokens.ts:18`,
`src/server/leagues.ts:12`). The token itself only ever lives in the admin link. Password
hashing must be slow (bcrypt, argon2) because people choose guessable passwords, so an
attacker with the hashes can try billions of guesses. This token is 24 random bytes
(192 bits) from `randomBytes`, so there is nothing to guess; a fast hash is enough to make
a database leak useless for building admin links.

**3.** `requireAdminLeague(token)` (`actions.ts:187`) returns league A. The match is looked
up with `where: { id: matchId, leagueId: league.id }` (line 193), so it's A's match. Then
line 195 checks that `goal.teamId` is that match's home or away team; league B's team id
isn't, so the action returns the field error "Pick one of the two teams in this match"
(line 196) and writes nothing. Scorer and assist ids are checked the same way against
league A (lines 198–200). The pattern throughout `actions.ts`: never trust an id from the
browser without filtering by the league that the token unlocked.

**4.** Neither moves. `computeStandings` keeps only FINISHED matches
(`src/domain/standings.ts:38`) and `computePlayerStats` skips non-finished ones
(`src/domain/playerStats.ts:28`). A live 3–0 can still
end 3–3, and a table that jumps around mid-game (or keeps a win that later became a
draw if the admin forgot to finish) is worse than one that updates at the final whistle.
The live score is shown separately on the match page and in "Live now".

**5.** All three are level after the overall tally, so `groupConsecutive` puts them in one
level group (`standings.ts:44`). Head-to-head builds a mini-table from only the matches
among those three (line 52): each won one and lost one 1–0, so they're level there too.
`compareH2H` returns 0 for every pair, so `sharesPosition` (line 62) is true for the
second and third teams: all three get position 1, listed alphabetically (Aces, Bears,
Comets). A fourth team below them would be position 4. This is the "1, 1, 1" case in
`standings.test.ts`.

**6.** Number of matches in the league and the newest `Match.updatedAt`, in ms
(`src/server/leagueVersion.ts:18`). `addGoal`'s transaction updates `match.updatedAt`
(`actions.ts:210`). Inserting a `MatchEvent` alone doesn't change the `Match` row, so
without that update the version would stay the same, `LiveUpdates` would never call
`router.refresh()` (`LiveUpdates.tsx:36`), and spectators would only see the goal after a
manual reload. `deleteGoal` bumps `updatedAt` for the same reason. Status changes update
the row, so `@updatedAt` bumps them automatically.

**7.** Vercel runs the app as serverless functions, which can't hold WebSocket
connections; that would need a separate realtime service (account, secrets, another system
to learn). SSE would keep a function running for each viewer for the whole match. Polling
a tiny endpoint works anywhere. Worst case ~3 s plus the request time. Cost: one small
aggregate query every 3 s per visible spectator during a live match (30 s otherwise), and
a full re-render only when something actually changed (docs/DECISIONS.md, M3).

**8.** `router.refresh()` re-runs the current route's Server Components on the server and
merges the new result into the page that's already open: no new document, JavaScript
state and scroll position are kept, and only the changed UI updates. `location.reload()`
throws the page away and loads everything again: a white flash, scroll jumps to the top,
and all scripts and styles are re-requested. On a phone during a match, the first feels
live and the second feels broken. The e2e live spec checks for this with a marker on
`window` (`PublicMatchPage.markDocument` / `isSameDocument`).

**9.** While hidden, each `check()` skips the fetch because `document.visibilityState`
isn't `"visible"` (`LiveUpdates.tsx:29–32`) but keeps scheduling itself, and browsers also
throttle background timers. On unlock the `visibilitychange` listener calls `check()`
immediately (line 46), so the page catches up at once instead of waiting for the next tick.

**10.** UI: the teams page doesn't show *Delete team* for a team with matches.
Server: `deleteTeam` counts the team's matches and refuses (`actions.ts`, `deleteTeam`),
covering stale pages and hand-made requests. Database: `Match.homeTeamId`,
`Match.awayTeamId` and `MatchEvent.teamId` use the default RESTRICT, so Postgres itself
refuses. The reason: deleting a team would rewrite past results and the table. The seed
deletes the demo league's matches first (which cascades to their goals) and then the
league (which cascades to teams and players), in one transaction (`prisma/seed.ts`).
Switching to NO ACTION was tried and didn't help (DECISIONS.md, M2).

**11.** React 19 resets a `<form>` after its action finishes, success or failure. Without
sending the values back, a validation error would also wipe what the user typed. Inputs
use `defaultValue={state.values?.x}`. A `<select>` only applies `defaultValue` when it
mounts, so a changing `key` forces a re-mount with the returned value
(`MatchForm.tsx`, `PlayerForms.tsx`). The key has to come before `{...a11y}`: a key after a
spread caused a React warning (question 14).

**12.** The zod schema turns the empty input into `null` (`src/server/schemas.ts`, the
`minute` field). `addGoal` line 204: if the minute is null and the match is LIVE with a
`startedAt`, it uses `elapsedMinute(startedAt, now)` (`src/domain/matchClock.ts:6`): 0–59
seconds after kick-off is minute 1, capped at 200. For a SCHEDULED match there's no clock,
so `minute` stays `null` and the goal list shows "–".

**13.** The rules can be tested with plain arrays: no database, no server, no mocks, and
each test runs in milliseconds. Example: `standings.test.ts` "breaks a full tie on
head-to-head" builds three matches with a helper and asserts that Bears rank above Aces.
Setting that up through the UI or the database would take dozens of steps per case. It
also keeps the rules readable on their own, separate from how data is fetched.

**14.** Setting up through the UI repeats the same clicks in every test: slow, and one
broken setup screen fails every test instead of just its own. `arrange`
(`e2e/support/arrange.ts`) writes the setup with the app's own Prisma client, and the
fixture deletes it after the test (`e2e/support/fixtures.ts`). `failOnConsoleErrors` fails
a test when the page logs an error, even though everything visible looks right: React
warnings, hydration mismatches, uncaught exceptions. It found a "missing key" warning on
the admin matches page, caused by `<Select {...a11y} key={...}>`. A key after a spread makes
the JSX compiler fall back to `createElement`, which changed React's key validation of the
select's children. Moving `key` before the spread fixed it.

**15.** `npm install` (its `postinstall` runs `prisma generate`), then the `vercel-build`
script: `prisma migrate deploy` (apply any new migrations) and `next build`. If a migration
fails, the build fails and the previous deployment keeps serving, so code never goes live
against a schema it doesn't match. The app uses Neon's **pooled** URL (`DATABASE_URL`,
read in `src/lib/db.ts`) because serverless functions open many short-lived connections.
Migrations use the **direct** URL (`DATABASE_URL_UNPOOLED` or `DIRECT_URL`, chosen in
`prisma.config.ts`) because `migrate` needs a session-level lock that a transaction pooler
can't hold.
