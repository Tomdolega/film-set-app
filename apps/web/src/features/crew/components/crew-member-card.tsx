"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { CrewMemberDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { removeCrewMemberAction, updateCrewMemberAction } from "../actions";

interface CrewMemberCardProps {
  organizationId: string;
  projectId: string;
  member: CrewMemberDto;
}

export function CrewMemberCard(props: CrewMemberCardProps) {
  const updateAction = updateCrewMemberAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.member.id,
  );
  const removeAction = removeCrewMemberAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.member.id,
  );
  const [state, formAction] = useActionState(updateAction, initialFormState);

  return (
    <div className="panel crew-card">
      <div className="panel__header">
        <div>
          <strong>{props.member.name}</strong>
          <p>
            {props.member.sourceType}
            {props.member.contactType ? ` | ${props.member.contactType}` : ""}
            {props.member.email ? ` | ${props.member.email}` : ""}
          </p>
        </div>
        <span className="pill">{props.member.accessRole}</span>
      </div>

      <form action={formAction} className="stack">
        <div className="field-grid">
          <label className="field">
            <span className="field__label">Access role</span>
            <select className="input" name="accessRole" defaultValue={props.member.accessRole}>
              <option value="member">member</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">Project role</span>
            <input
              className="input"
              type="text"
              name="projectRole"
              defaultValue={props.member.projectRole ?? ""}
            />
          </label>
        </div>

        {state.error ? <p className="field-error">{state.error}</p> : null}
        <SubmitButton label="Save crew member" pendingLabel="Saving crew..." />
      </form>

      {props.member.accessRole === "owner" ? null : (
        <form action={removeAction} className="crew-card__remove">
          <button type="submit" className="button button--secondary">
            Remove
          </button>
        </form>
      )}
    </div>
  );
}
