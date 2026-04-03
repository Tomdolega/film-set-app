"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { createShootingDayAction } from "../actions";

interface CreateShootingDayFormProps {
  organizationId: string;
  projectId: string;
}

export function CreateShootingDayForm(props: CreateShootingDayFormProps) {
  const action = createShootingDayAction.bind(null, props.organizationId, props.projectId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Create shooting day</h2>
        <p>Define the production window first, then add crew assignments on the detail page.</p>
      </div>

      <label className="field">
        <span className="field__label">Title</span>
        <input
          className="input"
          type="text"
          name="title"
          placeholder="Day 1 | Main Unit"
          required
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Date</span>
          <input className="input" type="date" name="date" required />
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select className="input" name="status" defaultValue="draft">
            <option value="draft">draft</option>
            <option value="locked">locked</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Location</span>
        <input className="input" type="text" name="location" placeholder="Studio A" required />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Start time</span>
          <input className="input" type="time" name="startTime" required />
        </label>

        <label className="field">
          <span className="field__label">End time</span>
          <input className="input" type="time" name="endTime" required />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea className="textarea" name="notes" rows={3} placeholder="Optional planning notes" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create shooting day" pendingLabel="Creating shooting day..." />
    </form>
  );
}
