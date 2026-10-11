import { expect, test } from "../support/fixtures";

const TEAMS = [
  { name: "Lions", players: ["Leo", "Lara"] },
  { name: "Tigers", players: ["Tom", "Tia"] },
];

test.describe("Record a match", () => {
  test("admin records goals with scorers and assists; the public match page shows them", async ({
    page,
    arrange,
    adminMatchesPage,
    adminMatchPage,
    publicMatchPage,
  }) => {
    const league = await arrange.league(TEAMS);

    await adminMatchesPage.goto(league.adminToken);
    const matchId = await adminMatchesPage.createMatch("Lions", "Tigers");

    await adminMatchPage.addGoal({ team: "Lions", scorer: "Leo", assist: "Lara", minute: 12 });
    await adminMatchPage.addGoal({ team: "Tigers", scorer: "Tom", minute: 30 });
    await adminMatchPage.addGoal({ team: "Lions", minute: 75 }); // own goal / unknown scorer
    await adminMatchPage.finish();

    await expect(adminMatchPage.scoreboard.score).toHaveText("2 – 1");

    await publicMatchPage.goto(league.slug, matchId);
    await expect(publicMatchPage.scoreboard.score).toHaveText("2 – 1");
    await expect(publicMatchPage.scoreboard.status("FT")).toBeVisible();
    await expect(publicMatchPage.goals.items).toHaveCount(3);
    await expect(publicMatchPage.goals.goalBy("Leo")).toContainText("12'");
    await expect(publicMatchPage.goals.goalBy("Leo")).toContainText("Assist: Lara");
    await expect(publicMatchPage.goals.goalBy("Own goal / unknown")).toContainText("75'");
    await expect(page).toHaveTitle(/Lions 2–1 Tigers/);
  });

  test("removing a goal updates the score", async ({ arrange, adminMatchPage }) => {
    const league = await arrange.league(TEAMS);
    const matchId = await arrange.match(league, "Lions", "Tigers", {
      status: "FINISHED",
      goals: [{ team: "Lions", scorer: "Leo" }, { team: "Tigers", scorer: "Tom" }],
    });

    await adminMatchPage.goto(league.adminToken, matchId);
    await expect(adminMatchPage.scoreboard.score).toHaveText("1 – 1");

    await adminMatchPage.removeGoalBy("Tom");

    await expect(adminMatchPage.scoreboard.score).toHaveText("1 – 0");
    await expect(adminMatchPage.goals.items).toHaveCount(1);
  });

  test("rejects a player assisting their own goal", async ({ page, arrange, adminMatchPage }) => {
    const league = await arrange.league(TEAMS);
    const matchId = await arrange.match(league, "Lions", "Tigers");

    await adminMatchPage.goto(league.adminToken, matchId);
    await page.getByLabel("Scorer").selectOption({ label: "Leo" });
    await page.getByLabel("Assist").selectOption({ label: "Leo" });
    await adminMatchPage.addGoalButton.click();

    await expect(page.getByText("A player can't assist their own goal")).toBeVisible();
    await expect(adminMatchPage.goals.items).toHaveCount(0);
  });
});
