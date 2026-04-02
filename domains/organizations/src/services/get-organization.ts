import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";

import { canReadOrganization } from "../permissions/organizations.permissions.js";
import type { OrganizationWithMembership } from "../model/organization.js";
import type { OrganizationsRepository } from "../repositories/organizations.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetOrganizationParams {
  organizationId: string;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationsRepository;
}

export async function getOrganization(params: GetOrganizationParams): Promise<OrganizationWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertOrganizationAccess({
    organizationId: params.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canReadOrganization(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const organization = await params.organizationsRepository.findOrganizationById(params.organizationId);

  if (!organization) {
    const error: StatusError = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  return { organization, membership };
}
