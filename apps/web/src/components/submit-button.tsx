"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
}

export function SubmitButton(props: SubmitButtonProps) {
  const status = useFormStatus();

  return (
    <button type="submit" className="button" disabled={status.pending}>
      {status.pending ? props.pendingLabel ?? "Saving..." : props.label}
    </button>
  );
}

