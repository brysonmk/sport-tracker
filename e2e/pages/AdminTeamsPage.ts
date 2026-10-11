import type { Locator, Page } from "@playwright/test";

/** /a/<token>/teams: add teams and players. */
export class AdminTeamsPage {
  readonly teamNameInput: Locator;
  readonly addTeamButton: Locator;
  readonly playerNameInput: Locator;
  readonly playerTeamSelect: Locator;
  readonly addPlayerButton: Locator;

  constructor(private readonly page: Page) {
    this.teamNameInput = page.getByLabel("Team name");
    this.addTeamButton = page.getByRole("button", { name: "Add team" });
    this.playerNameInput = page.getByLabel("Player name");
    this.playerTeamSelect = page.getByLabel("Team", { exact: true });
    this.addPlayerButton = page.getByRole("button", { name: "Add player" });
  }

  async goto(adminToken: string) {
    await this.page.goto(`/a/${adminToken}/teams`);
  }

  async addTeam(name: string) {
    await this.teamNameInput.fill(name);
    await this.addTeamButton.click();
    await this.teamRow(name).waitFor();
  }

  async addPlayer(name: string, team: string) {
    await this.playerNameInput.fill(name);
    await this.playerTeamSelect.selectOption({ label: team });
    await this.addPlayerButton.click();
    await this.page.getByText(name, { exact: true }).waitFor();
  }

  /** A team in the Teams list (its <summary> row). */
  teamRow(name: string): Locator {
    return this.page.getByRole("region", { name: "Teams" }).locator("summary").filter({ hasText: name });
  }
}
