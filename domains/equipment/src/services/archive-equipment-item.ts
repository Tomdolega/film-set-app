import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import { canManageEquipment } from "../permissions/equipment.permissions.js";
import type { EquipmentRepository } from "../repositories/equipment.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ArchiveEquipmentItemParams {
  equipmentId: string;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  equipmentRepository: EquipmentRepository;
}

export async function archiveEquipmentItem(params: ArchiveEquipmentItemParams): Promise<void> {
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

  await params.equipmentRepository.archiveEquipmentItem(params.equipmentId);
}
