import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { EquipmentItemsListResult } from "../model/equipment-item.js";
import { canReadEquipment } from "../permissions/equipment.permissions.js";
import type { EquipmentRepository } from "../repositories/equipment.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListEquipmentItemsParams {
  organizationId: string;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  equipmentRepository: EquipmentRepository;
}

export async function listEquipmentItems(
  params: ListEquipmentItemsParams,
): Promise<EquipmentItemsListResult> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertOrganizationAccess({
    organizationId: params.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canReadEquipment(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const equipmentItems = await params.equipmentRepository.listEquipmentItemsByOrganization(
    params.organizationId,
  );

  return {
    equipmentItems,
    currentUserRole: membership.role,
  };
}
