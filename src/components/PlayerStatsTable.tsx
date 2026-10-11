import type { PlayerStatsRow } from "@/domain/playerStats";

export function PlayerStatsTable({ rows, caption = "Player stats" }: { rows: PlayerStatsRow[]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="tabular w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th scope="col" className="py-2 pl-3 text-left font-medium">Player</th>
            <th scope="col" className="px-2 py-2 text-right font-medium"><abbr title="Goals">G</abbr></th>
            <th scope="col" className="px-2 py-2 text-right font-medium"><abbr title="Assists">A</abbr></th>
            <th scope="col" className="py-2 pl-2 pr-3 text-right font-medium"><abbr title="Goals plus assists">G+A</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.playerId} className="border-b border-line last:border-0">
              <th scope="row" className="py-2.5 pl-3 text-left font-normal">
                <span className="font-medium">{r.playerName}</span>
                {r.teamName && <span className="block text-xs text-muted">{r.teamName}</span>}
              </th>
              <td data-col="goals" className="px-2 py-2.5 text-right font-bold">{r.goals}</td>
              <td data-col="assists" className="px-2 py-2.5 text-right">{r.assists}</td>
              <td data-col="contributions" className="py-2.5 pl-2 pr-3 text-right text-muted">{r.contributions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
