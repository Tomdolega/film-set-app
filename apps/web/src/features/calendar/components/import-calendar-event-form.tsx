"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { importCalendarEventAction } from "../actions";

interface ImportCalendarEventFormProps {
  organizationId: string;
  projectId: string;
}

export function ImportCalendarEventForm(props: ImportCalendarEventFormProps) {
  const action = importCalendarEventAction.bind(null, props.organizationId, props.projectId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Import calendar event</h2>
        <p>
          Paste a single calendar event JSON payload. Import creates a new shooting day and then
          redirects to its detail page where conflicts are shown normally.
        </p>
      </div>

      <label className="field">
        <span className="field__label">Event JSON</span>
        <textarea
          className="textarea textarea--code"
          name="eventJson"
          rows={12}
          placeholder={getCalendarEventExample()}
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Import event" pendingLabel="Importing event..." />
    </form>
  );
}

function getCalendarEventExample() {
  return `{
  "id": "google-event-123",
  "title": "Studio booking",
  "description": "Prep and lighting setup",
  "startDateTime": "2026-05-04T08:00:00Z",
  "endDateTime": "2026-05-04T12:00:00Z",
  "location": "Stage 4",
  "attendees": ["producer@example.com", "gaffer@example.com"],
  "source": "google"
}`;
}
