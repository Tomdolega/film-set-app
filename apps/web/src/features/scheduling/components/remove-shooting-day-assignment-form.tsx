"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { removeShootingDayAssignmentAction } from "../actions";

interface RemoveShootingDayAssignmentFormProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
  assignmentId: string;
}

export function RemoveShootingDayAssignmentForm(
  props: RemoveShootingDayAssignmentFormProps,
) {
  const action = removeShootingDayAssignmentAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDayId,
    props.assignmentId,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton label="Remove" pendingLabel="Removing..." variant="secondary" />
    </form>
  );
}
