"use client";

import { useActionState } from "react";

import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/submit-button";
import type { EquipmentDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { assignEquipmentToShootingDayAction } from "../actions";

interface AddShootingDayEquipmentFormProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
  availableEquipment: EquipmentDto[];
}

export function AddShootingDayEquipmentForm(props: AddShootingDayEquipmentFormProps) {
  const action = assignEquipmentToShootingDayAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDayId,
  );
  const [state, formAction] = useActionState(action, initialFormState);

  if (props.availableEquipment.length === 0) {
    return (
      <section className="panel">
        <p className="eyebrow">Assign equipment</p>
        <EmptyState
          title="No assignable equipment available"
          description="Add equipment in the organization inventory, or free up an item from another assignment before adding it here."
        />
      </section>
    );
  }

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Assign equipment</h2>
        <p>Assign a real organization equipment item to this shooting day.</p>
      </div>

      <label className="field">
        <span className="field__label">Equipment item</span>
        <select className="input" name="referenceId" defaultValue="" required>
          <option value="" disabled>
            Select organization equipment
          </option>
          {props.availableEquipment.map((equipmentItem) => (
            <option key={equipmentItem.id} value={equipmentItem.id}>
              {equipmentItem.name} ({equipmentItem.category})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Schedule label</span>
        <input className="input" type="text" name="label" placeholder="Optional override label" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Assign equipment" pendingLabel="Assigning equipment..." />
    </form>
  );
}
