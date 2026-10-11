import type { PlayerStatsRow } from "@/domain/playerStats";
import type { StandingsRow } from "@/domain/standings";
import type { MatchStatus } from "@/domain/types";

/**
 * Rows for the CSV downloads (see src/app/api/leagues/[slug]/export). Pure functions
 * over the same data the pages show, so a download always matches the screen.
 */

type ExportMatch = {
  status: MatchStatus;
  kickoffAt: Date | null;
  startedAt: Date | null;
  home: { name: string };
  away: { name: string };
  score: { home: number; away: number };
  goals: { side: "home" | "away"; minute: number | null; scorer: { name: string } | null; assist: { name: string } | null }[];
};

export const EXPORT_KINDS = ["standings", "players", "matches", "goals"] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

const STATUS_LABEL: Record<MatchStatus, string> = { SCHEDULED: "Scheduled", LIVE: "Live", FINISHED: "Finished" };

/** ISO date-time in UTC, which every spreadsheet can parse. */
const when = (m: ExportMatch) => (m.kickoffAt ?? m.startedAt)?.toISOString() ?? "";

export function standingsCsvRows(rows: StandingsRow[]) {
  return [
    ["Position", "Team", "Played", "Won", "Drawn", "Lost", "Goals for", "Goals against", "Goal difference", "Points"],
    ...rows.map((r) => [r.position, r.teamName, r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst, r.goalDifference, r.points]),
  ];
}

export function playersCsvRows(rows: PlayerStatsRow[]) {
  return [
    ["Player", "Team", "Goals", "Assists", "Goals + assists"],
    ...rows.map((r) => [r.playerName, r.teamName, r.goals, r.assists, r.contributions]),
  ];
}

export function matchesCsvRows(matches: ExportMatch[]) {
  return [
    ["Date (UTC)", "Status", "Home", "Home goals", "Away goals", "Away"],
    ...matches.map((m) => {
      const played = m.status !== "SCHEDULED";
      return [when(m), STATUS_LABEL[m.status], m.home.name, played ? m.score.home : null, played ? m.score.away : null, m.away.name];
    }),
  ];
}

export function goalsCsvRows(matches: ExportMatch[]) {
  return [
    ["Match date (UTC)", "Match", "Minute", "Team", "Scorer", "Assist"],
    ...matches.flatMap((m) =>
      m.goals.map((g) => [
        when(m),
        `${m.home.name} vs ${m.away.name}`,
        g.minute,
        g.side === "home" ? m.home.name : m.away.name,
        g.scorer?.name ?? "Own goal / unknown",
        g.assist?.name ?? null,
      ]),
    ),
  ];
}
