"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
}

export function SubmitButton(props: SubmitButtonProps) {
  const status = useFormStatus();
  const className =
    props.variant === "secondary" ? "button button--secondary" : "button";

  return (
    <button type="submit" className={className} disabled={status.pending}>
      {status.pending ? props.pendingLabel ?? "Saving..." : props.label}
    </button>
  );
}
