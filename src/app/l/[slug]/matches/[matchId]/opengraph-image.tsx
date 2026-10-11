import { ImageResponse } from "next/og";
import { elapsedMinute } from "@/domain/matchClock";
import { findLeagueBySlug } from "@/server/leagues";
import { getLeagueSnapshot } from "@/server/snapshot";

/**
 * The picture chat apps (WhatsApp, iMessage, Slack, Discord…) show when a match link is
 * pasted. Next.js sees this file and adds <meta property="og:image"> to the match page
 * automatically. The image is drawn from JSX by next/og (satori), which supports a
 * subset of CSS: flexbox layout and inline styles only.
 *
 * Chat apps cache previews, so a link shared mid-game may keep showing the old score.
 */

export const alt = "Match score card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#0f7a3d";

export default async function Image({ params }: { params: Promise<{ slug: string; matchId: string }> }) {
  const { slug, matchId } = await params;
  const league = await findLeagueBySlug(slug);
  const match = league ? (await getLeagueSnapshot(league.id)).matches.find((m) => m.id === matchId) : undefined;

  if (!league || !match) {
    return new ImageResponse(<Card top="Sports Tracker" middle={<Text size={64}>Match not found</Text>} bottom="" />, size);
  }

  const played = match.status !== "SCHEDULED";
  const status =
    match.status === "LIVE"
      ? `LIVE${match.startedAt ? ` · ${elapsedMinute(match.startedAt, new Date())}'` : ""}`
      : match.status === "FINISHED"
        ? "Full time"
        : "Upcoming";

  return new ImageResponse(
    (
      <Card
        top={league.name}
        middle={
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 40 }}>
            <TeamName name={match.home.name} align="flex-end" />
            <div
              style={{
                display: "flex",
                fontSize: 150,
                fontWeight: 700,
                background: "white",
                color: GREEN,
                borderRadius: 32,
                padding: "8px 48px",
                letterSpacing: -4,
              }}
            >
              {played ? `${match.score.home}–${match.score.away}` : "vs"}
            </div>
            <TeamName name={match.away.name} align="flex-start" />
          </div>
        }
        bottom={status}
      />
    ),
    size,
  );
}

function Card({ top, middle, bottom }: { top: string; middle: React.ReactNode; bottom: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 64,
        background: GREEN,
        color: "white",
      }}
    >
      <Text size={40}>{top}</Text>
      {middle}
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", fontSize: 34, opacity: 0.85 }}>
        <span>{bottom}</span>
        <span>⚽ Sports Tracker</span>
      </div>
    </div>
  );
}

function Text({ size, children }: { size: number; children: React.ReactNode }) {
  return <div style={{ display: "flex", fontSize: size, textAlign: "center" }}>{children}</div>;
}

function TeamName({ name, align }: { name: string; align: "flex-start" | "flex-end" }) {
  return (
    <div style={{ display: "flex", flex: 1, justifyContent: align, fontSize: 60, fontWeight: 700, lineHeight: 1.1, textAlign: align === "flex-end" ? "right" : "left" }}>
      {name}
    </div>
  );
}
