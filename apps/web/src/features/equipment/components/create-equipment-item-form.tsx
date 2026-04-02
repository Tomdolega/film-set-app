"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

import { createEquipmentItemAction } from "../actions";

interface CreateEquipmentItemFormProps {
  organizationId: string;
}

export function CreateEquipmentItemForm(props: CreateEquipmentItemFormProps) {
  const action = createEquipmentItemAction.bind(null, props.organizationId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="form-card">
      <div className="form-card__header">
        <h2>Create equipment item</h2>
        <p>Add a real equipment record that can later be scheduled on shooting days.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" placeholder="Sony FX6 #1" />
      </label>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">Category</span>
          <select className="input" name="category" defaultValue="other">
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
          <select className="input" name="status" defaultValue="available">
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
        <input className="input" type="text" name="serialNumber" placeholder="Optional serial" />
      </label>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea className="textarea" name="description" rows={3} placeholder="Optional description" />
      </label>

      <label className="field">
        <span className="field__label">Notes</span>
        <textarea className="textarea" name="notes" rows={3} placeholder="Optional notes" />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create equipment item" pendingLabel="Creating equipment item..." />
    </form>
  );
}
