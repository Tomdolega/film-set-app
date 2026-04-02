"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { ContactDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { addCrewMemberAction } from "../actions";

interface AddCrewMemberFormProps {
  organizationId: string;
  projectId: string;
  contacts: ContactDto[];
}

export function AddCrewMemberForm(props: AddCrewMemberFormProps) {
  const action = addCrewMemberAction.bind(null, props.organizationId, props.projectId);
  const [state, formAction] = useActionState(action, initialFormState);

  if (props.contacts.length === 0) {
    return (
      <section className="panel">
        <div className="form-card__header">
          <h2>Add crew member</h2>
          <p>
            No unassigned contacts are available for this project. Add more contacts or reuse this
            page after removing a crew assignment.
          </p>
        </div>
        <Link href={`/organizations/${props.organizationId}/contacts`} className="text-link">
          Go to contacts
        </Link>
      </section>
    );
  }

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Add crew member</h2>
        <p>Assign an existing organization contact to this project.</p>
      </div>

      <label className="field">
        <span className="field__label">Contact</span>
        <select className="input" name="contactId" defaultValue="">
          <option value="" disabled>
            Select a contact
          </option>
          {props.contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
              {contact.company ? ` (${contact.company})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Access role</span>
        <select className="input" name="accessRole" defaultValue="member">
          <option value="member">member</option>
          <option value="admin">admin</option>
          <option value="owner">owner</option>
        </select>
      </label>

      <label className="field">
        <span className="field__label">Project role</span>
        <input className="input" type="text" name="projectRole" placeholder="camera, sound, producer" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Add crew member" pendingLabel="Adding crew member..." />
    </form>
  );
}
