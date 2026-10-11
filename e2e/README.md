# End-to-end tests

Playwright tests for the main user flows, run on a phone-sized browser (Pixel 7) and a
desktop browser.

## Run them

```bash
docker compose up -d          # the tests write to the database in DATABASE_URL
npm run test:e2e              # reuses `npm run dev` on :3000 if it's running, else starts it
npm run test:e2e:ui           # Playwright's UI mode: watch, time-travel, pick locators
npx playwright test --project=mobile record-match   # one project, one file
npx playwright show-report    # last HTML report (traces for failed tests)
```

CI runs the same suite against a production build (`.github/workflows/ci.yml`, job
`e2e`). When it fails, download the `playwright-report` artifact from the run and open it
with `npx playwright show-report <folder>`.

## Layout

```
playwright.config.ts      projects (mobile, desktop), web server, traces on failure
e2e/
  support/
    fixtures.ts           `test` and `expect` for every spec: page-object fixtures,
                          `arrange`, `uniqueName`, the console-error guard
    arrange.ts            create leagues/matches straight in the database
  pages/                  page objects, one per screen
    components.ts         pieces shared by several pages (Scoreboard, GoalTimeline)
    CreateLeaguePage.ts   /new
    AdminMatchesPage.ts   /a/<token>            (admin home, new match)
    AdminTeamsPage.ts     /a/<token>/teams
    AdminMatchPage.ts     /a/<token>/matches/<id> (record goals, start/finish)
    PublicLeaguePage.ts   /l/<slug>              (table)
    PublicMatchPage.ts    /l/<slug>/matches/<id> (live view)
    PublicPlayersPage.ts  /l/<slug>/players
  tests/                  one spec per flow
    create-league.spec.ts
    record-match.spec.ts
    standings.spec.ts
    live-view.spec.ts
```

## Conventions

- **Import `test` and `expect` from `../support/fixtures`**, never from
  `@playwright/test`, so every test gets the fixtures and the console-error guard.
- **Arrange through the database, act through the UI.** Use `arrange.league(...)` and
  `arrange.match(...)` for setup. Click through the UI only for the flow under test.
  Everything `arrange` creates is deleted after the test, pass or fail. If a test creates a
  league through the UI, register it with `arrange.cleanUpLeagueNamed(name)`.
- **Unique names** (`uniqueName("Sunday 5s")`) so tests can run in parallel, and against a
  database that already has data.
- **Locators by role and label first** (`getByRole`, `getByLabel`), the way a user or a
  screen reader finds things. That also tests accessibility for free. The only test hooks
  are `data-col` on the stats table cells, because some columns are hidden on phones and
  hidden cells aren't in the accessibility tree.
- **Page objects hold locators and actions; specs hold assertions.** An action waits for
  its own result (e.g. `addGoal` waits for the goal to appear), so specs never need
  `waitForTimeout`.
- **Console errors fail the test** (`failOnConsoleErrors` in fixtures.ts). If a page is
  supposed to log one, allow it for that test:
  `test.use({ allowedConsoleErrors: [/status of 404/] })`.

## Adding a test

1. If the screen has no page object yet, add one in `e2e/pages/` and a fixture for it
   in `fixtures.ts`.
2. Write the spec in `e2e/tests/<flow>.spec.ts`: arrange data, drive the UI through page
   objects, assert with web-first assertions (`await expect(locator).toHaveText(...)`).
3. Run it on both projects a few times: `npx playwright test <file> --repeat-each=5`.

## Things worth knowing

- **Live updates**: public pages poll every 3 s while a match is live and 30 s otherwise
  (`src/components/LiveUpdates.tsx`). The live spec arranges a match that's already live
  so it runs on the 3 s path. Polling pauses in hidden tabs; headless pages count as
  visible.
- **Team buttons on the goal form** are radio inputs hidden behind their labels, so the
  page object clicks the label text, like a person tapping it.
