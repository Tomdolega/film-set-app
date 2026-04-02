import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ContactWithMembership } from "../model/contact.js";
import { canManageContacts } from "../permissions/contacts.permissions.js";
import type { ContactsRepository } from "../repositories/contacts.repository.js";
import { parseUpdateContactInput } from "../schemas/contact-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateContactParams {
  contactId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  contactsRepository: ContactsRepository;
}

export async function updateContact(params: UpdateContactParams): Promise<ContactWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const existingContact = await params.contactsRepository.findContactById(params.contactId);

  if (!existingContact) {
    const error: StatusError = new Error("Contact not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertOrganizationAccess({
    organizationId: existingContact.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canManageContacts(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const input = parseUpdateContactInput(params.input);
  const contact = await params.contactsRepository.updateContact(params.contactId, input);

  if (!contact) {
    const error: StatusError = new Error("Contact not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    contact,
    currentUserRole: membership.role,
  };
}
