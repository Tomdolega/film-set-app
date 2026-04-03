import { getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";

import type { OrganizationWithMembership } from "../model/organization.js";
import type { OrganizationsRepository } from "../repositories/organizations.repository.js";

export interface ListOrganizationsParams {
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationsRepository;
}

export async function listOrganizations(
  params: ListOrganizationsParams,
): Promise<OrganizationWithMembership[]> {
  const sessionUser = getSessionUser(params.sessionUser);

  return params.organizationsRepository.listOrganizationsForUser(sessionUser.id);
}
