import { expect, test } from "../support/fixtures";

const TEAMS = [
  { name: "Aces", players: ["Ana"] },
  { name: "Bears", players: ["Ben"] },
  { name: "Comets", players: ["Cal"] },
];

test.describe("Standings update", () => {
  test("finishing a match updates the table and player stats", async ({
    arrange,
    adminMatchPage,
    publicLeaguePage,
    publicPlayersPage,
  }) => {
    const league = await arrange.league(TEAMS);
    // Already played: Bears drew with Comets.
    await arrange.match(league, "Bears", "Comets", { status: "FINISHED", goals: [{ team: "Bears" }, { team: "Comets" }] });
    const matchId = await arrange.match(league, "Aces", "Bears");

    // Before: Aces haven't played.
    await publicLeaguePage.goto(league.slug);
    expect(await publicLeaguePage.row("Aces")).toMatchObject({ played: 0, points: 0 });

    // Admin records Aces 2-0 Bears.
    await adminMatchPage.goto(league.adminToken, matchId);
    await adminMatchPage.start();
    await adminMatchPage.addGoal({ team: "Aces", scorer: "Ana" });
    await adminMatchPage.addGoal({ team: "Aces", scorer: "Ana" });

    // While live, the table hasn't moved.
    await publicLeaguePage.goto(league.slug);
    expect(await publicLeaguePage.row("Aces")).toMatchObject({ played: 0, points: 0 });

    // Final whistle.
    await adminMatchPage.goto(league.adminToken, matchId);
    await adminMatchPage.finish();

    await publicLeaguePage.goto(league.slug);
    expect(await publicLeaguePage.teamOrder()).toEqual(["Aces", "Comets", "Bears"]);
    expect(await publicLeaguePage.row("Aces")).toEqual({
      position: 1, played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3,
    });
    expect(await publicLeaguePage.row("Comets")).toMatchObject({ position: 2, played: 1, drawn: 1, points: 1, goalDifference: 0 });
    expect(await publicLeaguePage.row("Bears")).toMatchObject({ position: 3, played: 2, drawn: 1, lost: 1, points: 1, goalDifference: -2 });

    await publicPlayersPage.goto(league.slug);
    expect(await publicPlayersPage.stats("Ana")).toEqual({ goals: 2, assists: 0 });
  });

  test("teams level on every tiebreaker share a position", async ({ arrange, publicLeaguePage }) => {
    const league = await arrange.league(TEAMS);
    await arrange.match(league, "Aces", "Bears", { status: "FINISHED" }); // 0-0

    await publicLeaguePage.goto(league.slug);
    expect((await publicLeaguePage.row("Aces")).position).toBe(1);
    expect((await publicLeaguePage.row("Bears")).position).toBe(1);
    // Comets have no points, so they are 3rd: positions go 1, 1, 3.
    expect((await publicLeaguePage.row("Comets")).position).toBe(3);
  });
});
