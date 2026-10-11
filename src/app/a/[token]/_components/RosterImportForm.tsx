"use client";

import { useActionState, useState } from "react";
import { Field, FormError } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { importRoster } from "../actions";

/**
 * Import players from a spreadsheet: choose a .csv file (read in the browser and shown
 * in the text box) or paste the rows. The server does all the checking.
 */
export function RosterImportForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(importRoster.bind(null, token), initialFormState);
  const [text, setText] = useState("");

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setText(await file.text());
  }

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <p className="text-sm text-muted">
        One player per row: <code>Player,Team</code>. A header row is optional. Teams that don&apos;t exist yet are
        created; players already in the league are skipped, so importing twice is safe.
      </p>
      <label className="text-sm font-medium">
        Choose a CSV file
        <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="mt-1 block w-full text-sm" />
      </label>
      <Field label="…or paste rows" name="csv" errors={state.fieldErrors?.csv}>
        {(a11y) => (
          <textarea
            {...a11y}
            name="csv"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Player,Team\nLeo,Lions\nTom,Tigers"}
            className="w-full rounded-lg border border-line bg-card px-3 py-2 font-mono text-sm"
          />
        )}
      </Field>
      <FormError message={state.error} />
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-accent-soft px-3 py-2 text-sm">
          {state.message}
        </p>
      )}
      <SubmitButton pendingText="Importing…">Import players</SubmitButton>
    </form>
  );
}
