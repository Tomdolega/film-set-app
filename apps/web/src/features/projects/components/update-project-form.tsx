"use client";

import { useActionState } from "react";

import type { ProjectDto } from "@/lib/api-types";
import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { updateProjectAction } from "../actions";

interface UpdateProjectFormProps {
  organizationId: string;
  project: ProjectDto;
}

export function UpdateProjectForm(props: UpdateProjectFormProps) {
  const action = updateProjectAction.bind(null, props.organizationId, props.project.id);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Edit project</h2>
        <p>Update the batch-1 fields and save them back through the API.</p>
      </div>

      <label className="field">
        <span className="field__label">Project name</span>
        <input className="input" type="text" name="name" defaultValue={props.project.name} required />
      </label>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea
          className="textarea"
          name="description"
          rows={4}
          defaultValue={props.project.description ?? ""}
        />
      </label>

      <label className="field">
        <span className="field__label">Status</span>
        <select className="input" name="status" defaultValue={props.project.status}>
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="archived">archived</option>
        </select>
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Start date</span>
          <input className="input" type="date" name="startDate" defaultValue={props.project.startDate ?? ""} />
        </label>

        <label className="field">
          <span className="field__label">End date</span>
          <input className="input" type="date" name="endDate" defaultValue={props.project.endDate ?? ""} />
        </label>
      </div>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Save project" pendingLabel="Saving project..." />
    </form>
  );
}
