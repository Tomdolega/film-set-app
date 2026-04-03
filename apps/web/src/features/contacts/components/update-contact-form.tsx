"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { ContactDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { updateContactAction } from "../actions";

interface UpdateContactFormProps {
  organizationId: string;
  contact: ContactDto;
}

export function UpdateContactForm(props: UpdateContactFormProps) {
  const action = updateContactAction.bind(null, props.organizationId, props.contact.id);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Edit contact</h2>
        <p>Keep the organization contact record current before using it in project crew.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" defaultValue={props.contact.name} required />
      </label>

      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="input"
          type="email"
          name="email"
          defaultValue={props.contact.email ?? ""}
        />
      </label>

      <label className="field">
        <span className="field__label">Phone</span>
        <input className="input" type="text" name="phone" defaultValue={props.contact.phone ?? ""} />
      </label>

      <label className="field">
        <span className="field__label">Company</span>
        <input
          className="input"
          type="text"
          name="company"
          defaultValue={props.contact.company ?? ""}
        />
      </label>

      <label className="field">
        <span className="field__label">Type</span>
        <select className="input" name="type" defaultValue={props.contact.type}>
          <option value="person">person</option>
          <option value="vendor">vendor</option>
          <option value="company">company</option>
        </select>
      </label>

      <label className="field">
        <span className="field__label">Tags</span>
        <input
          className="input"
          type="text"
          name="tags"
          defaultValue={props.contact.tags.join(", ")}
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Save contact" pendingLabel="Saving contact..." />
    </form>
  );
}
