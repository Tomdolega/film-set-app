import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ContactWithMembership } from "../model/contact.js";
import { canReadContacts } from "../permissions/contacts.permissions.js";
import type { ContactsRepository } from "../repositories/contacts.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetContactParams {
  contactId: string;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  contactsRepository: ContactsRepository;
}

export async function getContact(params: GetContactParams): Promise<ContactWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const contact = await params.contactsRepository.findContactById(params.contactId);

  if (!contact) {
    const error: StatusError = new Error("Contact not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertOrganizationAccess({
    organizationId: contact.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canReadContacts(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  return {
    contact,
    currentUserRole: membership.role,
  };
}
