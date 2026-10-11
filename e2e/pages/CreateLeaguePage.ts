import type { Locator, Page } from "@playwright/test";

/** /new: the create-league form. */
export class CreateLeaguePage {
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly nameError: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel("League name");
    this.submitButton = page.getByRole("button", { name: "Create league" });
    this.nameError = page.getByText("League name is required");
  }

  async goto() {
    await this.page.goto("/new");
  }

  /** Submits the form. On success the app redirects to the new league's admin page. */
  async create(name: string) {
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }
}
