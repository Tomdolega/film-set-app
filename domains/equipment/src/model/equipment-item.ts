export type EquipmentCategory =
  | "camera"
  | "lens"
  | "audio"
  | "light"
  | "grip"
  | "accessory"
  | "other";

export type EquipmentStatus =
  | "available"
  | "reserved"
  | "checked_out"
  | "maintenance"
  | "unavailable";

export interface EquipmentItem {
  id: string;
  organizationId: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  description: string | null;
  serialNumber: string | null;
  notes: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentItemWithMembership {
  equipmentItem: EquipmentItem;
  currentUserRole: "owner" | "admin" | "member";
}

export interface EquipmentItemsListResult {
  equipmentItems: EquipmentItem[];
  currentUserRole: "owner" | "admin" | "member";
}
