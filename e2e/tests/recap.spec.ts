import { expect, test } from "../support/fixtures";

// AI recaps exist only when the server has ANTHROPIC_API_KEY. CI and a default local
// setup don't, so this checks the feature stays completely hidden.
test.describe("AI recaps without an API key", () => {
  test.skip(Boolean(process.env.ANTHROPIC_API_KEY), "the server may have a key; nothing to check");

  test("no recap button or recap section anywhere", async ({ page, arrange, adminMatchPage, publicMatchPage }) => {
    const league = await arrange.league([{ name: "Lions" }, { name: "Tigers" }]);
    const matchId = await arrange.match(league, "Lions", "Tigers", { status: "FINISHED", goals: [{ team: "Lions" }] });

    await adminMatchPage.goto(league.adminToken, matchId);
    await expect(adminMatchPage.scoreboard.score).toHaveText("1 – 0");
    await expect(page.getByRole("button", { name: /recap/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "AI recap" })).toHaveCount(0);

    await publicMatchPage.goto(league.slug, matchId);
    await expect(publicMatchPage.scoreboard.score).toHaveText("1 – 0");
    await expect(page.getByRole("heading", { name: "Recap" })).toHaveCount(0);
  });
});
