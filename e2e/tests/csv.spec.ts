import { readFile } from "node:fs/promises";
import { expect, test } from "../support/fixtures";

test.describe("CSV import and export", () => {
  test("admin imports a roster from pasted CSV", async ({ page, arrange, adminTeamsPage }) => {
    const league = await arrange.league([{ name: "Lions", players: ["Leo"] }]);

    await adminTeamsPage.goto(league.adminToken);
    await page.getByLabel("…or paste rows").fill("Player,Team\nLeo,Lions\nLara,lions\nTom,Tigers\n,Nobody");
    await page.getByRole("button", { name: "Import players" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Added" })).toHaveText(
      "Added 2 players and 1 team. 1 player already in the league, skipped. Line 5: no player name, skipped.",
    );
    // Lara joined the existing Lions (team names match ignoring case); Tigers was created.
    await expect(adminTeamsPage.teamRow("Tigers")).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Lions \(2\)$/ })).toBeVisible();
  });

  test("anyone can download the league table as CSV", async ({ page, arrange }) => {
    const league = await arrange.league([{ name: "Lions" }, { name: "Tigers" }]);
    await arrange.match(league, "Lions", "Tigers", { status: "FINISHED", goals: [{ team: "Lions" }] });

    await page.goto(`/a/${league.adminToken}/settings`);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "League table" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(`${league.slug}-standings.csv`);
    const csv = await readFile(await download.path(), "utf8");
    expect(csv.split("\r\n").slice(0, 3)).toEqual([
      "Position,Team,Played,Won,Drawn,Lost,Goals for,Goals against,Goal difference,Points",
      "1,Lions,1,1,0,0,1,0,1,3",
      "2,Tigers,1,0,0,1,0,1,-1,0",
    ]);
  });
});
