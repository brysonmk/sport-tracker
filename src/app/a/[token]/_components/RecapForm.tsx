"use client";

import { useActionState } from "react";
import { FormError } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/lib/formState";
import { writeMatchRecap } from "../actions";

/** "Write recap" / "Rewrite recap" for a finished match. */
export function RecapForm({ token, matchId, hasRecap }: { token: string; matchId: string; hasRecap: boolean }) {
  const [state, formAction] = useActionState(writeMatchRecap.bind(null, token, matchId), initialFormState);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormError message={state.error} />
      <SubmitButton variant={hasRecap ? "secondary" : "primary"} pendingText="Writing… (a few seconds)">
        {hasRecap ? "Rewrite recap" : "Write recap"}
      </SubmitButton>
    </form>
  );
}
