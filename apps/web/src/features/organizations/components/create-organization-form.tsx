"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { createOrganizationAction } from "../actions";

export function CreateOrganizationForm() {
  const [state, formAction] = useActionState(createOrganizationAction, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Create organization</h2>
        <p>Start by creating the organization that will own projects.</p>
      </div>

      <label className="field">
        <span className="field__label">Organization name</span>
        <input className="input" type="text" name="name" placeholder="Small Studio" required />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create organization" pendingLabel="Creating organization..." />
    </form>
  );
}
