import type { Locator, Page } from "@playwright/test";

/** /l/<slug>/players: goals and assists per player. */
export class PublicPlayersPage {
  readonly table: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole("table", { name: "Player stats" });
  }

  async goto(slug: string) {
    await this.page.goto(`/l/${slug}/players`);
  }

  async stats(player: string): Promise<{ goals: number; assists: number }> {
    const row = this.table.getByRole("row").filter({ has: this.page.getByRole("rowheader", { name: new RegExp(`^${player}`) }) });
    const read = async (col: string) => Number(await row.locator(`[data-col='${col}']`).textContent());
    return { goals: await read("goals"), assists: await read("assists") };
  }
}
