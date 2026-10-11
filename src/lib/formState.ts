/**
 * What a server action returns to its form (via React's useActionState).
 *   - `ok`: the action succeeded
 *   - `error`: one message for the whole form
 *   - `fieldErrors`: messages per input name, shown under that input
 *   - `values`: what the user typed, sent back on failure. React 19 resets a form after
 *     its action runs, so without this a validation error would also wipe the inputs.
 *
 * Lives in src/lib (not src/server) because client components import it too.
 */
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};
