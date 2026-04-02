import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { EquipmentItemWithMembership } from "../model/equipment-item.js";
import { canManageEquipment } from "../permissions/equipment.permissions.js";
import type { EquipmentRepository } from "../repositories/equipment.repository.js";
import { parseUpdateEquipmentItemInput } from "../schemas/equipment-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateEquipmentItemParams {
  equipmentId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  equipmentRepository: EquipmentRepository;
}

export async function updateEquipmentItem(
  params: UpdateEquipmentItemParams,
): Promise<EquipmentItemWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const existingItem = await params.equipmentRepository.findEquipmentItemById(params.equipmentId);

  if (!existingItem) {
    const error: StatusError = new Error("Equipment item not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertOrganizationAccess({
    organizationId: existingItem.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canManageEquipment(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const input = parseUpdateEquipmentItemInput(params.input);
  const equipmentItem = await params.equipmentRepository.updateEquipmentItem(params.equipmentId, input);

  if (!equipmentItem) {
    const error: StatusError = new Error("Equipment item not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    equipmentItem,
    currentUserRole: membership.role,
  };
}
