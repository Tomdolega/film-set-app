"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { markAllNotificationsAsReadAction } from "../actions";

interface MarkAllNotificationsReadFormProps {
  disabled: boolean;
}

export function MarkAllNotificationsReadForm(props: MarkAllNotificationsReadFormProps) {
  const [state, formAction] = useActionState(markAllNotificationsAsReadAction, initialFormState);

  if (props.disabled) {
    return null;
  }

  return (
    <form action={formAction} className="stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton
        label="Mark all as read"
        pendingLabel="Updating..."
        variant="secondary"
      />
    </form>
  );
}
