import { expect, test } from "../support/fixtures";

test.describe("Player profiles and the personal feed", () => {
  test("a player's page shows totals and goals by match", async ({ page, arrange, publicPlayersPage, playerPage }) => {
    const league = await arrange.league([
      { name: "Lions", players: ["Leo", "Lara"] },
      { name: "Tigers", players: ["Tom"] },
    ]);
    await arrange.match(league, "Lions", "Tigers", {
      status: "FINISHED",
      goals: [{ team: "Lions", scorer: "Leo", assist: "Lara" }, { team: "Lions", scorer: "Leo" }, { team: "Tigers", scorer: "Tom" }],
    });

    // From the stats table, open the player.
    await publicPlayersPage.goto(league.slug);
    await page.getByRole("link", { name: "Leo" }).click();

    await expect(playerPage.name).toHaveText("Leo");
    await expect(playerPage.stat("Goals")).toHaveText("2");
    await expect(playerPage.stat("Assists")).toHaveText("0");
    await expect(playerPage.stat("Scorer rank")).toHaveText("#1");
    await expect(page.getByRole("img", { name: /Leo's goals and assists.*Latest: Goals 2, Assists 0/ })).toBeVisible();
    await expect(playerPage.matchLog).toHaveCount(1);
    await expect(playerPage.matchLog.first()).toContainText("Lions 2–1 Tigers");
    await expect(playerPage.matchLog.first()).toContainText("2 G");
  });

  test("visited leagues and followed players appear on the home page", async ({ arrange, publicLeaguePage, playerPage, homePage }) => {
    const league = await arrange.league([{ name: "Lions", players: ["Leo"] }, { name: "Tigers" }]);
    await arrange.match(league, "Lions", "Tigers", { status: "FINISHED", goals: [{ team: "Lions", scorer: "Leo" }] });

    // Visiting the league remembers it on this device.
    await publicLeaguePage.goto(league.slug);
    await expect(publicLeaguePage.table).toBeVisible();

    await playerPage.goto(league.slug, league.playerIds["Leo"]);
    await playerPage.followButton.click();
    await expect(playerPage.followButton).toHaveText("Following ✓");

    await homePage.goto();
    const card = homePage.leagueCard(league.name);
    await expect(card).toContainText("Lions 1–0 Tigers");
    await expect(card).toContainText("Top of the table: Lions (3 pts)");
    await expect(homePage.followedPlayers.filter({ hasText: "Leo" })).toContainText("1 G · 0 A");
  });
});
