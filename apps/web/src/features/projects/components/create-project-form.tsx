"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { createProjectAction } from "../actions";

interface CreateProjectFormProps {
  organizationId: string;
}

export function CreateProjectForm(props: CreateProjectFormProps) {
  const action = createProjectAction.bind(null, props.organizationId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Create project</h2>
        <p>Use the minimal project fields required in batch 1.</p>
      </div>

      <label className="field">
        <span className="field__label">Project name</span>
        <input className="input" type="text" name="name" placeholder="Pilot Project" required />
      </label>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea className="textarea" name="description" rows={4} placeholder="Project summary" />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Start date</span>
          <input className="input" type="date" name="startDate" />
        </label>

        <label className="field">
          <span className="field__label">End date</span>
          <input className="input" type="date" name="endDate" />
        </label>
      </div>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create project" pendingLabel="Creating project..." />
    </form>
  );
}
