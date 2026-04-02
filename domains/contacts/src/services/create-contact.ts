import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ContactWithMembership } from "../model/contact.js";
import { canManageContacts } from "../permissions/contacts.permissions.js";
import type { ContactsRepository } from "../repositories/contacts.repository.js";
import { parseCreateContactInput } from "../schemas/contact-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateContactParams {
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  contactsRepository: ContactsRepository;
}

export async function createContact(params: CreateContactParams): Promise<ContactWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const input = parseCreateContactInput(params.input);
  const membership = await assertOrganizationAccess({
    organizationId: input.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canManageContacts(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const contact = await params.contactsRepository.createContact(input);

  return {
    contact,
    currentUserRole: membership.role,
  };
}
