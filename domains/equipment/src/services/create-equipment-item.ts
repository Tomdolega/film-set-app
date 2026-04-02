import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { EquipmentItemWithMembership } from "../model/equipment-item.js";
import { canManageEquipment } from "../permissions/equipment.permissions.js";
import type { EquipmentRepository } from "../repositories/equipment.repository.js";
import { parseCreateEquipmentItemInput } from "../schemas/equipment-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateEquipmentItemParams {
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  equipmentRepository: EquipmentRepository;
}

export async function createEquipmentItem(
  params: CreateEquipmentItemParams,
): Promise<EquipmentItemWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const input = parseCreateEquipmentItemInput(params.input);
  const membership = await assertOrganizationAccess({
    organizationId: input.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canManageEquipment(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const equipmentItem = await params.equipmentRepository.createEquipmentItem(input);

  return {
    equipmentItem,
    currentUserRole: membership.role,
  };
}
