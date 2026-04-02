import type { NextFunction, Request, Response } from "express";

import { listContacts, type ContactsRepository } from "@film-set-app/domain-contacts";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentContactRecord } from "../../presenters/contact.presenter.js";

interface ListContactsControllerParams {
  organizationsRepository: OrganizationsRepository;
  contactsRepository: ContactsRepository;
}

export function createListContactsController(params: ListContactsControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const organizationId =
        typeof request.query.organizationId === "string" ? request.query.organizationId : undefined;

      const result = await listContacts({
        organizationId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        contactsRepository: params.contactsRepository,
      });

      response
        .status(200)
        .json(result.contacts.map((contact) => presentContactRecord(contact, result.currentUserRole)));
    } catch (error) {
      next(error);
    }
  };
}
