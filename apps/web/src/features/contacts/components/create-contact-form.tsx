"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { createContactAction } from "../actions";

interface CreateContactFormProps {
  organizationId: string;
}

export function CreateContactForm(props: CreateContactFormProps) {
  const action = createContactAction.bind(null, props.organizationId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Create contact</h2>
        <p>Add an organization contact that can later be assigned to projects.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" placeholder="Alex Producer" />
      </label>

      <label className="field">
        <span className="field__label">Email</span>
        <input className="input" type="email" name="email" placeholder="alex@example.com" />
      </label>

      <label className="field">
        <span className="field__label">Phone</span>
        <input className="input" type="text" name="phone" placeholder="+48 555 555 555" />
      </label>

      <label className="field">
        <span className="field__label">Company</span>
        <input className="input" type="text" name="company" placeholder="Studio or vendor name" />
      </label>

      <label className="field">
        <span className="field__label">Type</span>
        <select className="input" name="type" defaultValue="person">
          <option value="person">person</option>
          <option value="vendor">vendor</option>
          <option value="company">company</option>
        </select>
      </label>

      <label className="field">
        <span className="field__label">Tags</span>
        <input className="input" type="text" name="tags" placeholder="producer, key contact" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create contact" pendingLabel="Creating contact..." />
    </form>
  );
}
