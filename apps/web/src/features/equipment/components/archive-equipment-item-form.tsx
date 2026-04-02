import { archiveEquipmentItemAction } from "../actions";

interface ArchiveEquipmentItemFormProps {
  organizationId: string;
  equipmentId: string;
}

export function ArchiveEquipmentItemForm(props: ArchiveEquipmentItemFormProps) {
  const action = archiveEquipmentItemAction.bind(null, props.organizationId, props.equipmentId);

  return (
    <form action={action}>
      <button type="submit" className="button button--secondary">
        Archive equipment item
      </button>
    </form>
  );
}
