"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { deleteDocumentAction } from "../actions";

interface DeleteDocumentFormProps {
  organizationId: string;
  projectId: string;
  documentId: string;
}

export function DeleteDocumentForm(props: DeleteDocumentFormProps) {
  const action = deleteDocumentAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.documentId,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="stack stack--tight">
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <SubmitButton label="Delete document" pendingLabel="Deleting..." variant="secondary" />
    </form>
  );
}
