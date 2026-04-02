"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { EquipmentDto } from "@/lib/api-types";
import { initialFormState } from "@/lib/form-state";

import { updateEquipmentItemAction } from "../actions";

interface UpdateEquipmentItemFormProps {
  organizationId: string;
  equipmentItem: EquipmentDto;
}

export function UpdateEquipmentItemForm(props: UpdateEquipmentItemFormProps) {
  const action = updateEquipmentItemAction.bind(null, props.organizationId, props.equipmentItem.id);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Edit equipment item</h2>
        <p>Keep equipment status and metadata current before assigning it to the schedule.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" defaultValue={props.equipmentItem.name} />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Category</span>
          <select className="input" name="category" defaultValue={props.equipmentItem.category}>
            <option value="camera">camera</option>
            <option value="lens">lens</option>
            <option value="audio">audio</option>
            <option value="light">light</option>
            <option value="grip">grip</option>
            <option value="accessory">accessory</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select className="input" name="status" defaultValue={props.equipmentItem.status}>
            <option value="available">available</option>
            <option value="reserved">reserved</option>
            <option value="checked_out">checked_out</option>
            <option value="maintenance">maintenance</option>
            <option value="unavailable">unavailable</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Serial number</span>
        <input
          className="input"
          type="text"
          name="serialNumber"
          defaultValue={props.equipmentItem.serialNumber ?? ""}
        />
      </label>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea
          className="textarea"
          name="description"
          rows={3}
          defaultValue={props.equipmentItem.description ?? ""}
        />
      </label>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea
          className="textarea"
          name="notes"
          rows={3}
          defaultValue={props.equipmentItem.notes ?? ""}
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Save equipment item" pendingLabel="Saving equipment item..." />
    </form>
  );
}
