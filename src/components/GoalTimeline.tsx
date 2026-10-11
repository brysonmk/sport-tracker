import type { GoalView } from "@/server/snapshot";

/**
 * The goals of a match in order. Home goals sit on the left, away goals on the right,
 * like a TV scoreboard. `renderAction` lets the admin page add a delete button per goal.
 */
export function GoalTimeline({
  goals,
  renderAction,
}: {
  goals: GoalView[];
  renderAction?: (goal: GoalView) => React.ReactNode;
}) {
  return (
    <ol className="flex flex-col gap-2">
      {goals.map((goal) => (
        <li
          key={goal.id}
          className={`flex items-center gap-3 ${goal.side === "away" ? "flex-row-reverse text-right" : ""}`}
        >
          <span className="tabular w-10 shrink-0 text-center text-sm text-muted">
            {goal.minute !== null ? `${goal.minute}'` : "–"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              <span aria-hidden>⚽ </span>
              {goal.scorer?.name ?? "Own goal / unknown"}
            </p>
            {goal.assist && <p className="truncate text-xs text-muted">Assist: {goal.assist.name}</p>}
          </div>
          {renderAction?.(goal)}
        </li>
      ))}
    </ol>
  );
}
