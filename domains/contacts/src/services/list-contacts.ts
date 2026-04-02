import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ContactsListResult } from "../model/contact.js";
import { canReadContacts } from "../permissions/contacts.permissions.js";
import type { ContactsRepository } from "../repositories/contacts.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListContactsParams {
  organizationId: string | undefined;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  contactsRepository: ContactsRepository;
}

export async function listContacts(params: ListContactsParams): Promise<ContactsListResult> {
  const sessionUser = getSessionUser(params.sessionUser);

  if (!params.organizationId?.trim()) {
    const error: StatusError = new Error("organizationId is required");
    error.statusCode = 400;
    throw error;
  }

  const membership = await assertOrganizationAccess({
    organizationId: params.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  if (!canReadContacts(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  const contacts = await params.contactsRepository.listContactsByOrganization(params.organizationId);

  return {
    contacts,
    currentUserRole: membership.role,
  };
}
