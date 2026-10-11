import { test as base, expect } from "@playwright/test";
import { AdminMatchPage } from "../pages/AdminMatchPage";
import { AdminMatchesPage } from "../pages/AdminMatchesPage";
import { AdminTeamsPage } from "../pages/AdminTeamsPage";
import { CreateLeaguePage } from "../pages/CreateLeaguePage";
import { PublicLeaguePage } from "../pages/PublicLeaguePage";
import { PublicMatchPage } from "../pages/PublicMatchPage";
import { PublicPlayersPage } from "../pages/PublicPlayersPage";
import * as db from "./arrange";

/**
 * Every test imports `test` and `expect` from here instead of @playwright/test. It adds:
 *
 *   - one fixture per page object, built on the test's `page`
 *   - `arrange`: create leagues/matches straight in the database; anything created is
 *     deleted after the test, even if it fails
 *   - `uniqueName(prefix)`: names that never clash between parallel tests or runs
 *   - `failOnConsoleErrors` (automatic): a test fails if the page logged a console error,
 *     e.g. a React warning or an uncaught exception, even if every assertion passed
 */

type Arrange = {
  /** A league with these teams (and players), named uniquely. */
  league(teams?: db.TeamSpec[]): Promise<db.ArrangedLeague>;
  match: typeof db.createMatch;
  /** Register a league created through the UI so it gets cleaned up too. */
  cleanUpLeagueNamed(name: string): void;
};

type Fixtures = {
  /** Console errors a test expects, e.g. the browser's own "404" log on a not-found page. */
  allowedConsoleErrors: RegExp[];
  failOnConsoleErrors: void;
  uniqueName: (prefix: string) => string;
  arrange: Arrange;
  createLeaguePage: CreateLeaguePage;
  adminMatchesPage: AdminMatchesPage;
  adminTeamsPage: AdminTeamsPage;
  adminMatchPage: AdminMatchPage;
  publicLeaguePage: PublicLeaguePage;
  publicMatchPage: PublicMatchPage;
  publicPlayersPage: PublicPlayersPage;
};

export const test = base.extend<Fixtures>({
  allowedConsoleErrors: [[], { option: true }],

  failOnConsoleErrors: [
    async ({ page, allowedConsoleErrors }, use) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        const text = message.text();
        if (message.type() === "error" && !allowedConsoleErrors.some((re) => re.test(text))) errors.push(text);
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await use();
      expect(errors, "console errors on the page").toEqual([]);
    },
    { auto: true },
  ],

  uniqueName: async ({}, use, testInfo) => {
    let counter = 0;
    await use((prefix) => `${prefix} e2e-${testInfo.workerIndex}-${Date.now().toString(36)}-${counter++}`);
  },

  arrange: async ({ uniqueName }, use) => {
    const leagueIds: string[] = [];
    const namesToFind: string[] = [];

    await use({
      league: async (teams = []) => {
        const league = await db.createLeague(uniqueName("League"), teams);
        leagueIds.push(league.id);
        return league;
      },
      match: db.createMatch,
      cleanUpLeagueNamed: (name) => namesToFind.push(name),
    });

    // Teardown: runs after the test, pass or fail.
    for (const name of namesToFind) {
      const id = await db.findLeagueIdByName(name);
      if (id) leagueIds.push(id);
    }
    for (const id of leagueIds) await db.deleteLeague(id);
  },

  createLeaguePage: async ({ page }, use) => use(new CreateLeaguePage(page)),
  adminMatchesPage: async ({ page }, use) => use(new AdminMatchesPage(page)),
  adminTeamsPage: async ({ page }, use) => use(new AdminTeamsPage(page)),
  adminMatchPage: async ({ page }, use) => use(new AdminMatchPage(page)),
  publicLeaguePage: async ({ page }, use) => use(new PublicLeaguePage(page)),
  publicMatchPage: async ({ page }, use) => use(new PublicMatchPage(page)),
  publicPlayersPage: async ({ page }, use) => use(new PublicPlayersPage(page)),
});

export { expect } from "@playwright/test";
