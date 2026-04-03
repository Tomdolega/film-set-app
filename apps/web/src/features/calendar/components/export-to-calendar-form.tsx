"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";

import {
  exportShootingDayToCalendarAction,
  initialExportCalendarFormState,
} from "../actions";

interface ExportToCalendarFormProps {
  shootingDayId: string;
}

export function ExportToCalendarForm(props: ExportToCalendarFormProps) {
  const action = exportShootingDayToCalendarAction.bind(null, props.shootingDayId);
  const [state, formAction] = useActionState(action, initialExportCalendarFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Export to calendar</h2>
        <p>Creates a stub Google Calendar event from the current shooting day data.</p>
      </div>

      <input type="hidden" name="provider" value="google" />

      {state.error ? <p className="field-error">{state.error}</p> : null}

      {state.externalEventId ? (
        <div className="notice notice--success">
          <strong>Calendar export created</strong>
          <p>
            Event: {state.eventTitle}
            <br />
            External id: {state.externalEventId}
          </p>
        </div>
      ) : null}

      <SubmitButton label="Export to Calendar" pendingLabel="Exporting..." />
    </form>
  );
}
