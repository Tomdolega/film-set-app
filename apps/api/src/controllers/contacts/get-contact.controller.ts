import type { NextFunction, Request, Response } from "express";

import { getContact, type ContactsRepository } from "@film-set-app/domain-contacts";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentContact } from "../../presenters/contact.presenter.js";

interface GetContactControllerParams {
  organizationsRepository: OrganizationsRepository;
  contactsRepository: ContactsRepository;
}

export function createGetContactController(params: GetContactControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const contactId =
        typeof request.params.contactId === "string" ? request.params.contactId : "";

      const result = await getContact({
        contactId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        contactsRepository: params.contactsRepository,
      });

      response.status(200).json(presentContact(result));
    } catch (error) {
      next(error);
    }
  };
}
