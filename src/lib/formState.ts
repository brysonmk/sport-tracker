/**
 * What a server action returns to its form (via React's useActionState).
 *   - `ok`: the action succeeded (the form can reset itself)
 *   - `error`: one message for the whole form
 *   - `fieldErrors`: messages per input name, shown under that input
 *
 * Lives in src/lib (not src/server) because client components import it too.
 */
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialFormState: FormState = {};
