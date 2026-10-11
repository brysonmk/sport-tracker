import type { Locator, Page } from "@playwright/test";

export type StandingsRow = {
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

const COLUMNS = ["position", "played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "points"] as const;

/** /l/<slug>: the public league page (table, results, top scorers). */
export class PublicLeaguePage {
  readonly heading: Locator;
  readonly table: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1 });
    this.table = page.getByRole("table", { name: "League table" });
  }

  async goto(slug: string) {
    await this.page.goto(`/l/${slug}`);
  }

  /** Team names in table order. */
  async teamOrder(): Promise<string[]> {
    return this.table.locator("tbody [data-col='team']").allTextContents();
  }

  /**
   * One team's row as numbers. Reads cells by their data-col name, so it works on phones
   * too, where some columns are hidden.
   */
  async row(team: string): Promise<StandingsRow> {
    const row = this.table.locator("tbody tr").filter({ has: this.page.locator(`[data-col='team']`, { hasText: team }) });
    const values = await Promise.all(
      COLUMNS.map(async (col) => Number((await row.locator(`[data-col='${col}']`).textContent())?.replace("+", ""))),
    );
    return Object.fromEntries(COLUMNS.map((col, i) => [col, values[i]])) as StandingsRow;
  }
}
