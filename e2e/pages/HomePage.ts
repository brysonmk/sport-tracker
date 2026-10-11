import type { Locator, Page } from "@playwright/test";

/** /: landing page, plus the personal feed for leagues/players this browser follows. */
export class HomePage {
  readonly yourLeagues: Locator;
  readonly followedPlayers: Locator;

  constructor(private readonly page: Page) {
    this.yourLeagues = page.getByRole("region", { name: "Your leagues" });
    this.followedPlayers = this.yourLeagues.getByRole("link").filter({ has: page.getByText(/\d+ G · \d+ A/) });
  }

  async goto() {
    await this.page.goto("/");
  }

  leagueCard(name: string): Locator {
    return this.yourLeagues.getByRole("listitem").filter({ hasText: name });
  }
}
