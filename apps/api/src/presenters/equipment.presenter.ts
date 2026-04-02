import type { EquipmentItem, EquipmentItemWithMembership } from "@film-set-app/domain-equipment";

export function presentEquipmentItem(result: EquipmentItemWithMembership) {
  return presentEquipmentItemRecord(result.equipmentItem, result.currentUserRole);
}

export function presentEquipmentItemRecord(
  equipmentItem: EquipmentItem,
  currentUserRole: "owner" | "admin" | "member",
) {
  return {
    id: equipmentItem.id,
    organizationId: equipmentItem.organizationId,
    name: equipmentItem.name,
    category: equipmentItem.category,
    status: equipmentItem.status,
    description: equipmentItem.description,
    serialNumber: equipmentItem.serialNumber,
    notes: equipmentItem.notes,
    archivedAt: equipmentItem.archivedAt ? equipmentItem.archivedAt.toISOString() : null,
    createdAt: equipmentItem.createdAt.toISOString(),
    updatedAt: equipmentItem.updatedAt.toISOString(),
    currentUserRole,
  };
}
