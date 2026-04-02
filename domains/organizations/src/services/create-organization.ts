import { getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";

import type { CreateOrganizationInput, OrganizationWithMembership } from "../model/organization.js";
import type { OrganizationsRepository } from "../repositories/organizations.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateOrganizationParams {
  input: CreateOrganizationInput;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationsRepository;
}

export async function createOrganization(
  params: CreateOrganizationParams,
): Promise<OrganizationWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const name = params.input.name?.trim();

  if (!name) {
    const error: StatusError = new Error("Organization name is required");
    error.statusCode = 400;
    throw error;
  }

  const organization = await params.organizationsRepository.createOrganization({ name });
  const membership = await params.organizationsRepository.addOrganizationMember({
    organizationId: organization.id,
    userId: sessionUser.id,
    role: "owner",
  });

  return { organization, membership };
}
