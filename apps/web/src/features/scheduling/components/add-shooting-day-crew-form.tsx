"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { CrewMemberDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { assignCrewToShootingDayAction } from "../actions";

interface AddShootingDayCrewFormProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
  availableCrew: CrewMemberDto[];
}

export function AddShootingDayCrewForm(props: AddShootingDayCrewFormProps) {
  const action = assignCrewToShootingDayAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDayId,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Assign crew</h2>
        <p>Assign an existing project crew member to this shooting day.</p>
      </div>

      <label className="field">
        <span className="field__label">Crew member</span>
        <select className="input" name="referenceId" defaultValue="">
          <option value="" disabled>
            Select project crew
          </option>
          {props.availableCrew.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
              {member.projectRole ? ` (${member.projectRole})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Schedule label</span>
        <input className="input" type="text" name="label" placeholder="Optional override label" />
      </label>

      <label className="field">
        <span className="field__label">Call time override</span>
        <input className="input" type="time" name="callTime" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Assign crew" pendingLabel="Assigning crew..." />
    </form>
  );
}
