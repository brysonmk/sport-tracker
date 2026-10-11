"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";

/**
 * A submit button that disables itself and shows `pendingText` while its <form>'s
 * server action is running, so a double tap on a phone doesn't add a goal twice.
 */
export function SubmitButton({
  children,
  pendingText = "Saving…",
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
