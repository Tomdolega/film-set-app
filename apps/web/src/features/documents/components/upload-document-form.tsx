"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { uploadDocumentAction } from "../actions";

interface UploadDocumentFormProps {
  organizationId: string;
  projectId: string;
}

export function UploadDocumentForm(props: UploadDocumentFormProps) {
  const action = uploadDocumentAction.bind(null, props.organizationId, props.projectId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Upload document</h2>
        <p>Upload a project file to object storage and create its metadata record in one step.</p>
      </div>

      <label className="field">
        <span className="field__label">File</span>
        <input className="input" type="file" name="file" required />
      </label>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" placeholder="Leave blank to use file name" />
      </label>

      <label className="field">
        <span className="field__label">Type</span>
        <select className="input" name="type" defaultValue="general">
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
        <textarea className="textarea" name="description" rows={3} placeholder="Optional note" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Upload document" pendingLabel="Uploading document..." />
    </form>
  );
}
