import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { EquipmentDto } from "@/lib/api-types";

interface EquipmentItemsListProps {
  organizationId: string;
  equipmentItems: EquipmentDto[];
}

export function EquipmentItemsList(props: EquipmentItemsListProps) {
  if (props.equipmentItems.length === 0) {
    return (
      <EmptyState
        title="No equipment yet"
        description="Create the first equipment item to start planning gear on shooting days."
      />
    );
  }

  return (
    <div className="stack">
      {props.equipmentItems.map((equipmentItem) => (
        <Link
          key={equipmentItem.id}
          href={`/organizations/${props.organizationId}/equipment/${equipmentItem.id}`}
          className="list-card"
        >
          <div>
            <strong>{equipmentItem.name}</strong>
            <p>
              {equipmentItem.category} | {equipmentItem.status}
              {equipmentItem.serialNumber ? ` | ${equipmentItem.serialNumber}` : ""}
            </p>
          </div>

          <span className="pill">{equipmentItem.category}</span>
        </Link>
      ))}
    </div>
  );
}
