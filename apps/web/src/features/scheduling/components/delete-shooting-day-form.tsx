"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { deleteShootingDayAction } from "../actions";

interface DeleteShootingDayFormProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
}

export function DeleteShootingDayForm(props: DeleteShootingDayFormProps) {
  const action = deleteShootingDayAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDayId,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton label="Delete shooting day" pendingLabel="Deleting..." variant="secondary" />
    </form>
  );
}
