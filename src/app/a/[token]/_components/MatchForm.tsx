"use client";

import { useActionState } from "react";
import { Field, FormError, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { createMatch } from "../actions";
import { KickoffInput } from "./KickoffInput";

export function MatchForm({ token, teams }: { token: string; teams: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createMatch.bind(null, token), initialFormState);
  const options = teams.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name}
    </option>
  ));
  // A <select>'s defaultValue only applies when it mounts, so each select is keyed on
  // the value sent back after a failed submit: a new key re-mounts it with that value.
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Home team" name="homeTeamId" errors={state.fieldErrors?.homeTeamId}>
          {(a11y) => (
            <Select key={state.values?.homeTeamId} {...a11y} name="homeTeamId" defaultValue={state.values?.homeTeamId ?? ""} required>
              <option value="" disabled>Choose…</option>
              {options}
            </Select>
          )}
        </Field>
        <Field label="Away team" name="awayTeamId" errors={state.fieldErrors?.awayTeamId}>
          {(a11y) => (
            <Select key={state.values?.awayTeamId} {...a11y} name="awayTeamId" defaultValue={state.values?.awayTeamId ?? ""} required>
              <option value="" disabled>Choose…</option>
              {options}
            </Select>
          )}
        </Field>
      </div>
      <Field label="Kickoff (optional)" name="kickoff" errors={state.fieldErrors?.kickoffAt} hint="Leave empty for a game you're about to play or already played.">
        {(a11y) => <KickoffInput id={a11y.id} describedBy={a11y["aria-describedby"]} />}
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Creating…">Create match</SubmitButton>
    </form>
  );
}
