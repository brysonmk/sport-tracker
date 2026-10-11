"use client";

import { useActionState } from "react";
import { Field, FormError, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { renameLeague } from "../actions";

export function RenameLeagueForm({ token, name }: { token: string; name: string }) {
  const [state, formAction] = useActionState(renameLeague.bind(null, token), initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <Field label="League name" name="league-name" errors={state.fieldErrors?.name}>
        {(a11y) => <Input {...a11y} name="name" defaultValue={state.values?.name ?? name} maxLength={60} />}
      </Field>
      <FormError message={state.error} />
      {state.ok && <p role="status" className="text-sm text-accent">Saved.</p>}
      <SubmitButton variant="secondary">Save name</SubmitButton>
    </form>
  );
}
