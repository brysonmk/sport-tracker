import type { Locator, Page } from "@playwright/test";

/** /l/<slug>/players/<id>: one player's totals and match log. */
export class PlayerPage {
  readonly name: Locator;
  readonly followButton: Locator;
  readonly matchLog: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByRole("heading", { level: 2 }).first();
    this.followButton = page.getByRole("button", { name: /^Follow/ });
    this.matchLog = page.getByRole("region", { name: "Goals and assists by match" }).getByRole("listitem");
  }

  async goto(slug: string, playerId: string) {
    await this.page.goto(`/l/${slug}/players/${playerId}`);
  }

  /** The number in a stat tile ("Goals", "Assists", "G+A", "Scorer rank"). */
  stat(label: string): Locator {
    return this.page.getByRole("term").filter({ hasText: label }).locator("xpath=following-sibling::dd[1]");
  }
}
