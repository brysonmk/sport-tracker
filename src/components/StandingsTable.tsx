import type { StandingsRow } from "@/domain/standings";

/**
 * The league table. On phones W/D/L and goals are hidden to fit; P, GD and Pts stay.
 * `data-col` names each cell for the end-to-end tests (hidden cells included).
 */
export function StandingsTable({ rows, caption = "League table" }: { rows: StandingsRow[]; caption?: string }) {
  const wide = "hidden sm:table-cell";
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="tabular w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th scope="col" className="w-8 py-2 pl-3 text-left font-medium"><abbr title="Position">#</abbr></th>
            <th scope="col" className="py-2 text-left font-medium">Team</th>
            <th scope="col" className="px-2 py-2 text-right font-medium"><abbr title="Played">P</abbr></th>
            <th scope="col" className={`px-2 py-2 text-right font-medium ${wide}`}><abbr title="Won">W</abbr></th>
            <th scope="col" className={`px-2 py-2 text-right font-medium ${wide}`}><abbr title="Drawn">D</abbr></th>
            <th scope="col" className={`px-2 py-2 text-right font-medium ${wide}`}><abbr title="Lost">L</abbr></th>
            <th scope="col" className={`px-2 py-2 text-right font-medium ${wide}`}><abbr title="Goals for">GF</abbr></th>
            <th scope="col" className={`px-2 py-2 text-right font-medium ${wide}`}><abbr title="Goals against">GA</abbr></th>
            <th scope="col" className="px-2 py-2 text-right font-medium"><abbr title="Goal difference">GD</abbr></th>
            <th scope="col" className="py-2 pl-2 pr-3 text-right font-medium"><abbr title="Points">Pts</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.teamId} className="border-b border-line last:border-0">
              <td data-col="position" className="py-2.5 pl-3 text-muted">{r.position}</td>
              <th scope="row" data-col="team" className="max-w-40 truncate py-2.5 text-left font-medium">{r.teamName}</th>
              <td data-col="played" className="px-2 py-2.5 text-right">{r.played}</td>
              <td data-col="won" className={`px-2 py-2.5 text-right ${wide}`}>{r.won}</td>
              <td data-col="drawn" className={`px-2 py-2.5 text-right ${wide}`}>{r.drawn}</td>
              <td data-col="lost" className={`px-2 py-2.5 text-right ${wide}`}>{r.lost}</td>
              <td data-col="goalsFor" className={`px-2 py-2.5 text-right ${wide}`}>{r.goalsFor}</td>
              <td data-col="goalsAgainst" className={`px-2 py-2.5 text-right ${wide}`}>{r.goalsAgainst}</td>
              <td data-col="goalDifference" className="px-2 py-2.5 text-right">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
              <td data-col="points" className="py-2.5 pl-2 pr-3 text-right font-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
