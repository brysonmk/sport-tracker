"use client";

import { useActionState } from "react";
import { Field, FormError, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { createLeagueAction } from "./actions";

export function CreateLeagueForm() {
  const [state, formAction] = useActionState(createLeagueAction, initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label="League name" name="name" errors={state.fieldErrors?.name} hint="e.g. Tuesday Night 5-a-side">
        {(a11y) => (
          <Input {...a11y} name="name" defaultValue={state.values?.name} required maxLength={60} autoComplete="off" autoFocus />
        )}
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Creating…">Create league</SubmitButton>
    </form>
  );
}
