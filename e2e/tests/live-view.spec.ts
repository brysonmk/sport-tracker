import { AdminMatchPage } from "../pages/AdminMatchPage";
import { expect, test } from "../support/fixtures";

test.describe("Live view", () => {
  test("the public match page updates within seconds without a reload", async ({ browser, arrange, publicMatchPage }) => {
    const league = await arrange.league([
      { name: "Lions", players: ["Leo"] },
      { name: "Tigers", players: ["Tom"] },
    ]);
    // Kicked off a moment ago: the public page polls every 3 s while a match is live.
    const matchId = await arrange.match(league, "Lions", "Tigers", { status: "LIVE" });

    // A spectator follows the match on the public page.
    await publicMatchPage.goto(league.slug, matchId);
    await expect(publicMatchPage.scoreboard.status("Live")).toBeVisible();
    await expect(publicMatchPage.scoreboard.score).toHaveText("0 – 0");
    await publicMatchPage.markDocument();

    // The organiser, on another phone, logs goals.
    const adminContext = await browser.newContext();
    const adminMatchPage = new AdminMatchPage(await adminContext.newPage());
    await adminMatchPage.goto(league.adminToken, matchId);

    await adminMatchPage.addGoal({ team: "Lions", scorer: "Leo" });
    await expect(publicMatchPage.scoreboard.score).toHaveText("1 – 0", { timeout: 8_000 });
    await expect(publicMatchPage.goals.goalBy("Leo")).toBeVisible();

    await adminMatchPage.addGoal({ team: "Tigers", scorer: "Tom" });
    await expect(publicMatchPage.scoreboard.score).toHaveText("1 – 1", { timeout: 8_000 });

    await adminMatchPage.finish();
    await expect(publicMatchPage.scoreboard.status("FT")).toBeVisible({ timeout: 8_000 });

    // All of that happened in the same document: no navigation, no full reload.
    expect(await publicMatchPage.isSameDocument()).toBe(true);
    await adminContext.close();
  });
});
