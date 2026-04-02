"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { ShootingDayDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { updateShootingDayAction } from "../actions";

interface UpdateShootingDayFormProps {
  organizationId: string;
  projectId: string;
  shootingDay: ShootingDayDto;
}

export function UpdateShootingDayForm(props: UpdateShootingDayFormProps) {
  const action = updateShootingDayAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDay.id,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Edit shooting day</h2>
        <p>Changing the time window updates conflict results immediately after reload.</p>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Date</span>
          <input className="input" type="date" name="date" defaultValue={props.shootingDay.date} />
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select className="input" name="status" defaultValue={props.shootingDay.status}>
            <option value="draft">draft</option>
            <option value="locked">locked</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Location</span>
        <input className="input" type="text" name="location" defaultValue={props.shootingDay.location} />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Start time</span>
          <input
            className="input"
            type="time"
            name="startTime"
            defaultValue={props.shootingDay.startTime.slice(0, 5)}
          />
        </label>

        <label className="field">
          <span className="field__label">End time</span>
          <input
            className="input"
            type="time"
            name="endTime"
            defaultValue={props.shootingDay.endTime.slice(0, 5)}
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea
          className="textarea"
          name="notes"
          rows={4}
          defaultValue={props.shootingDay.notes ?? ""}
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Save shooting day" pendingLabel="Saving shooting day..." />
    </form>
  );
}
