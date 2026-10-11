"use client";

import { useActionState } from "react";
import { Field, FormError, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { addTeam, renameTeam } from "../actions";

export function AddTeamForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(addTeam.bind(null, token), initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
      <div className="flex-1">
        <Field label="Team name" name="team-name" errors={state.fieldErrors?.name}>
          {(a11y) => <Input {...a11y} name="name" defaultValue={state.values?.name} maxLength={40} autoComplete="off" />}
        </Field>
      </div>
      <SubmitButton className="sm:mt-6" pendingText="Adding…">Add team</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}

export function RenameTeamForm({ token, team }: { token: string; team: { id: string; name: string } }) {
  const [state, formAction] = useActionState(renameTeam.bind(null, token, team.id), initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
      <div className="flex-1">
        <Field label={<>New name<span className="sr-only"> for {team.name}</span></>} name={`rename-${team.id}`} errors={state.fieldErrors?.name}>
          {(a11y) => <Input {...a11y} name="name" defaultValue={state.values?.name ?? team.name} maxLength={40} />}
        </Field>
      </div>
      <SubmitButton variant="secondary" className="sm:mt-6" aria-label={`Save name for ${team.name}`}>
        Save
      </SubmitButton>
    </form>
  );
}
