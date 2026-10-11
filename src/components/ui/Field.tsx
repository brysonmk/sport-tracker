import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const control =
  "min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger";

/**
 * A labelled form control with its error message. The error is linked to the input
 * with aria-describedby so screen readers read it out.
 */
export function Field({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: React.ReactNode;
  name: string;
  errors?: string[];
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [errors?.length ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(errors?.length), "aria-describedby": describedBy })}
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={errorId} className="text-sm text-danger">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

// `children` is passed as real JSX children (not inside the spread): spreading an array
// of children through props makes React treat it as a list and warn about missing keys.
export function Select({ children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${control} ${className}`}>
      {children}
    </select>
  );
}

/** A message for the whole form (not tied to one input). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
