import type { Locator, Page } from "@playwright/test";
import { GoalTimeline, Scoreboard } from "./components";

export type GoalInput = {
  /** Team name, as shown on the "Goal for" buttons. */
  team: string;
  /** Player name; leave out for an own goal / unknown scorer. */
  scorer?: string;
  assist?: string;
  minute?: number;
};

/** /a/<token>/matches/<id>: record goals and change the match status. */
export class AdminMatchPage {
  readonly scoreboard: Scoreboard;
  readonly goals: GoalTimeline;
  readonly startButton: Locator;
  readonly finishButton: Locator;
  readonly markFinishedButton: Locator;
  readonly reopenButton: Locator;
  readonly addGoalButton: Locator;

  constructor(private readonly page: Page) {
    this.scoreboard = new Scoreboard(page);
    this.goals = new GoalTimeline(page);
    this.startButton = page.getByRole("button", { name: "Start match (live)" });
    this.finishButton = page.getByRole("button", { name: "Finish match" });
    this.markFinishedButton = page.getByRole("button", { name: "Mark as finished" });
    this.reopenButton = page.getByRole("button", { name: "Reopen match" });
    this.addGoalButton = page.getByRole("button", { name: "Add goal" });
  }

  async goto(adminToken: string, matchId: string) {
    await this.page.goto(`/a/${adminToken}/matches/${matchId}`);
  }

  async start() {
    await this.startButton.click();
    await this.finishButton.waitFor();
  }

  /** Finishes a live match (or marks a scheduled one finished). */
  async finish() {
    // Waits for whichever of the two buttons the page shows (no isVisible() race).
    await this.finishButton.or(this.markFinishedButton).click();
    await this.reopenButton.waitFor();
  }

  /** Records one goal and waits until it appears in the goal list. */
  async addGoal(goal: GoalInput) {
    const before = await this.goals.items.count();
    // The radio itself is visually hidden; people tap its label (the big team button).
    await this.page.getByRole("group", { name: "Goal for" }).getByText(goal.team, { exact: true }).click();
    await this.page.getByLabel("Scorer", { exact: true }).selectOption(goal.scorer ? { label: goal.scorer } : { index: 0 });
    await this.page.getByLabel("Assist", { exact: true }).selectOption(goal.assist ? { label: goal.assist } : { index: 0 });
    await this.page.getByLabel("Minute", { exact: true }).fill(goal.minute?.toString() ?? "");
    await this.addGoalButton.click();
    await this.page.waitForFunction(
      ([n]) => document.querySelectorAll("section[aria-labelledby='goals'] li").length > n,
      [before],
    );
  }

  /** Removes the goal by this scorer (accepting the confirm dialog). */
  async removeGoalBy(scorer: string) {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.page.getByRole("button", { name: `Remove goal by ${scorer}` }).click();
  }
}
