import type { EquipmentCategory, EquipmentItem, EquipmentStatus } from "../model/equipment-item.js";

export interface CreateEquipmentItemRecord {
  organizationId: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  description: string | null;
  serialNumber: string | null;
  notes: string | null;
}

export interface UpdateEquipmentItemRecord {
  name?: string;
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  description?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
}

export interface EquipmentLookupRepository {
  findEquipmentItemById: (equipmentId: string) => Promise<EquipmentItem | null>;
}

export interface EquipmentRepository extends EquipmentLookupRepository {
  createEquipmentItem: (input: CreateEquipmentItemRecord) => Promise<EquipmentItem>;
  listEquipmentItemsByOrganization: (
    organizationId: string,
    options?: { includeArchived?: boolean },
  ) => Promise<EquipmentItem[]>;
  updateEquipmentItem: (
    equipmentId: string,
    input: UpdateEquipmentItemRecord,
  ) => Promise<EquipmentItem | null>;
  archiveEquipmentItem: (equipmentId: string) => Promise<EquipmentItem | null>;
}
