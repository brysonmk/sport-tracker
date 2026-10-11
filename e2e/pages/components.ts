import type { Locator, Page } from "@playwright/test";

/**
 * Pieces of UI that appear on several pages. Page objects compose these instead of
 * repeating the same locators.
 */

/** The big score at the top of a match page (admin and public). */
export class Scoreboard {
  constructor(private readonly page: Page) {}

  /** The score element, e.g. text "2 – 1". Its accessible name is "Score 2 to 1". */
  get score(): Locator {
    return this.page.getByLabel(/^(Score \d+ to \d+|Not started)$/);
  }

  /** "Live", "FT" or "Upcoming". */
  status(name: "Live" | "FT" | "Upcoming"): Locator {
    return this.page.getByText(name, { exact: true }).first();
  }
}

/** The list of goals on a match page. */
export class GoalTimeline {
  constructor(private readonly page: Page) {}

  get items(): Locator {
    return this.page.getByRole("region", { name: "Goals" }).getByRole("listitem");
  }

  /** The goal row naming this scorer ("Own goal / unknown" for none). */
  goalBy(scorer: string): Locator {
    return this.items.filter({ hasText: scorer });
  }
}
