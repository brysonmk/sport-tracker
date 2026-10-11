"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { parseLeagueLink } from "@/lib/leagueLink";

/** Paste a public or admin link; we jump to it. Nothing is sent to the server. */
export function OpenLeagueForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const link = new FormData(e.currentTarget).get("link");
        const path = typeof link === "string" ? parseLeagueLink(link) : null;
        if (!path) {
          setError("That doesn't look like a league link. It should contain /l/… or /a/….");
          return;
        }
        router.push(path);
      }}
    >
      <Field label="League link" name="link" errors={error ? [error] : undefined}>
        {(a11y) => <Input {...a11y} name="link" placeholder="https://…/l/your-league" autoComplete="off" />}
      </Field>
      <Button type="submit">Open</Button>
    </form>
  );
}
