"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { markNotificationAsReadAction } from "../actions";

interface MarkNotificationReadFormProps {
  notificationId: string;
}

export function MarkNotificationReadForm(props: MarkNotificationReadFormProps) {
  const action = markNotificationAsReadAction.bind(null, props.notificationId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="notification-card__actions stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton label="Mark as read" pendingLabel="Updating..." variant="secondary" />
    </form>
  );
}
