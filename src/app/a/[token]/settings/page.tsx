import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, Section } from "@/components/ui/Card";
import { CopyLink } from "@/components/ui/CopyLink";
import { findLeagueByAdminToken } from "@/server/leagues";
import { RenameLeagueForm } from "../_components/RenameLeagueForm";

export const metadata: Metadata = { title: "Links & settings" };

export default async function AdminSettingsPage({ params }: PageProps<"/a/[token]/settings">) {
  const { token } = await params;
  const league = await findLeagueByAdminToken(token);
  if (!league) notFound();

  return (
    <div>
      <Section title="Public link" id="public-link">
        <Card>
          <p className="mb-3 text-sm text-muted">Share this with your players. Anyone with it can view, nobody can edit.</p>
          <CopyLink path={`/l/${league.slug}`} label="Public link" />
        </Card>
      </Section>

      <Section title="Admin link" id="admin-link">
        <Card>
          <p className="mb-3 text-sm text-muted">
            Anyone with this link can edit the league. Only share it with people who should record matches. It
            can&apos;t be recovered or changed, so keep a copy.
          </p>
          <CopyLink path={`/a/${token}`} label="Admin link" />
        </Card>
      </Section>

      <Section title="League" id="league-settings">
        <Card>
          <RenameLeagueForm token={token} name={league.name} />
        </Card>
      </Section>
    </div>
  );
}
