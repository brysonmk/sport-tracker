"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";

/**
 * A one-button form that asks "are you sure?" before running a server action.
 * `action` is a server action already bound to its arguments by the server component.
 */
export function ConfirmButton({
  action,
  confirmMessage,
  children,
  variant = "danger",
  className,
  ariaLabel,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  variant?: "danger" | "secondary" | "ghost";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <form action={action}>
      <Inner confirmMessage={confirmMessage} variant={variant} className={className} ariaLabel={ariaLabel}>
        {children}
      </Inner>
    </form>
  );
}

function Inner({
  confirmMessage,
  variant,
  className,
  ariaLabel,
  children,
}: {
  confirmMessage: string;
  variant: "danger" | "secondary" | "ghost";
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      aria-label={ariaLabel}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
