"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { archiveEquipmentItemAction } from "../actions";

interface ArchiveEquipmentItemFormProps {
  organizationId: string;
  equipmentId: string;
}

export function ArchiveEquipmentItemForm(props: ArchiveEquipmentItemFormProps) {
  const action = archiveEquipmentItemAction.bind(null, props.organizationId, props.equipmentId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton
        label="Archive equipment item"
        pendingLabel="Archiving..."
        variant="secondary"
      />
    </form>
  );
}
