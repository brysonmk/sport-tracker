import type { Page } from "@playwright/test";
import { GoalTimeline, Scoreboard } from "./components";

/** /l/<slug>/matches/<id>: one match, live-updating while in progress. */
export class PublicMatchPage {
  readonly scoreboard: Scoreboard;
  readonly goals: GoalTimeline;

  constructor(private readonly page: Page) {
    this.scoreboard = new Scoreboard(page);
    this.goals = new GoalTimeline(page);
  }

  async goto(slug: string, matchId: string) {
    await this.page.goto(`/l/${slug}/matches/${matchId}`);
  }

  /**
   * Puts a marker on the current document. If the page later still has it, it was
   * updated in place: no navigation or full reload happened.
   */
  async markDocument() {
    await this.page.evaluate(() => {
      (window as unknown as { __e2eMarker: boolean }).__e2eMarker = true;
    });
  }

  async isSameDocument(): Promise<boolean> {
    return this.page.evaluate(() => (window as unknown as { __e2eMarker?: boolean }).__e2eMarker === true);
  }
}
