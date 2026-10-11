import type { Locator, Page } from "@playwright/test";

/** /a/<token>: the admin home. Lists matches and has the new-match form. */
export class AdminMatchesPage {
  readonly heading: Locator;
  readonly welcomeCard: Locator;
  readonly adminLinkInput: Locator;
  readonly publicLinkInput: Locator;
  readonly homeTeamSelect: Locator;
  readonly awayTeamSelect: Locator;
  readonly createMatchButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1 });
    this.welcomeCard = page.getByText("Your league is ready");
    this.adminLinkInput = page.getByRole("textbox", { name: "Admin link" });
    this.publicLinkInput = page.getByRole("textbox", { name: "Public link" });
    this.homeTeamSelect = page.getByLabel("Home team");
    this.awayTeamSelect = page.getByLabel("Away team");
    this.createMatchButton = page.getByRole("button", { name: "Create match" });
  }

  async goto(adminToken: string) {
    await this.page.goto(`/a/${adminToken}`);
  }

  /** The admin token from the current URL (/a/<token>...). */
  adminToken(): string {
    const match = new URL(this.page.url()).pathname.match(/^\/a\/([^/]+)/);
    if (!match) throw new Error(`Not on an admin page: ${this.page.url()}`);
    return match[1];
  }

  /** Creates a match; the app then opens that match's admin page. Returns its id. */
  async createMatch(home: string, away: string): Promise<string> {
    await this.homeTeamSelect.selectOption({ label: home });
    await this.awayTeamSelect.selectOption({ label: away });
    await this.createMatchButton.click();
    await this.page.waitForURL(/\/a\/[^/]+\/matches\/[^/]+$/);
    return this.page.url().split("/").at(-1)!;
  }
}
