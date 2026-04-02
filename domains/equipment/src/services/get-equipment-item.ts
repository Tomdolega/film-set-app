import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { EquipmentItemWithMembership } from "../model/equipment-item.js";
import { canReadEquipment } from "../permissions/equipment.permissions.js";
import type { EquipmentRepository } from "../repositories/equipment.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetEquipmentItemParams {
  equipmentId: string;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  equipmentRepository: EquipmentRepository;
}

export async function getEquipmentItem(
  params: GetEquipmentItemParams,
): Promise<EquipmentItemWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const equipmentItem = await params.equipmentRepository.findEquipmentItemById(params.equipmentId);

  if (!equipmentItem) {
    const error: StatusError = new Error("Equipment item not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertOrganizationAccess({
    organizationId: equipmentItem.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canReadEquipment(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  return {
    equipmentItem,
    currentUserRole: membership.role,
  };
}
