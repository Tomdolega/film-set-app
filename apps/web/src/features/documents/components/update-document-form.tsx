"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { DocumentDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { updateDocumentAction } from "../actions";

interface UpdateDocumentFormProps {
  organizationId: string;
  projectId: string;
  document: DocumentDto;
}

export function UpdateDocumentForm(props: UpdateDocumentFormProps) {
  const action = updateDocumentAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.document.id,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Edit document metadata</h2>
        <p>Update the document name, type, and description without touching the stored file.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" defaultValue={props.document.name} />
      </label>

      <label className="field">
        <span className="field__label">Type</span>
        <select className="input" name="type" defaultValue={props.document.type}>
          <option value="general">general</option>
          <option value="call_sheet">call_sheet</option>
          <option value="crew_list">crew_list</option>
          <option value="gear_list">gear_list</option>
          <option value="schedule">schedule</option>
          <option value="notes">notes</option>
          <option value="contract">contract</option>
          <option value="invoice">invoice</option>
          <option value="other">other</option>
        </select>
      </label>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea
          className="textarea"
          name="description"
          rows={4}
          defaultValue={props.document.description ?? ""}
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Save document" pendingLabel="Saving document..." />
    </form>
  );
}
