import { expect, test } from "../support/fixtures";

test.describe("Create a league", () => {
  test("creates a league with no signup and shows both links", async ({
    page,
    createLeaguePage,
    adminMatchesPage,
    adminTeamsPage,
    arrange,
    uniqueName,
  }) => {
    const name = uniqueName("Sunday 5s");
    arrange.cleanUpLeagueNamed(name);

    await createLeaguePage.goto();
    await createLeaguePage.create(name);

    // Lands on the admin page with a "save your links" card.
    await expect(page).toHaveURL(/\/a\/[A-Za-z0-9_-]{32}\?created=1$/);
    await expect(adminMatchesPage.heading).toHaveText(name);
    await expect(adminMatchesPage.welcomeCard).toBeVisible();
    await expect(adminMatchesPage.adminLinkInput).toHaveValue(new RegExp(`/a/${adminMatchesPage.adminToken()}$`));
    await expect(adminMatchesPage.publicLinkInput).toHaveValue(/\/l\/sunday-5s-e2e-[a-z0-9-]+$/);

    // The public link works and shows the league to anyone.
    const publicUrl = await adminMatchesPage.publicLinkInput.inputValue();
    const token = adminMatchesPage.adminToken();
    await page.goto(publicUrl);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(page.getByText("This league has no teams yet")).toBeVisible();

    // The admin link keeps working after leaving it: add the first team.
    await adminTeamsPage.goto(token);
    await adminTeamsPage.addTeam("Lions");
    await expect(adminTeamsPage.teamRow("Lions")).toBeVisible();
  });

  test("requires a league name", async ({ page, createLeaguePage }) => {
    await createLeaguePage.goto();
    await createLeaguePage.submitButton.click();

    await expect(createLeaguePage.nameError).toBeVisible();
    await expect(page).toHaveURL(/\/new$/);
  });

  test.describe("with a wrong admin link", () => {
    // The browser itself logs the 404 response as a console error.
    test.use({ allowedConsoleErrors: [/status of 404/] });

    test("shows not found", async ({ page }) => {
      await page.goto(`/a/${"x".repeat(32)}`);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    });
  });
});
