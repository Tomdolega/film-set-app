import type { NextFunction, Request, Response } from "express";

import { createContact, type ContactsRepository } from "@film-set-app/domain-contacts";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentContact } from "../../presenters/contact.presenter.js";

interface CreateContactControllerParams {
  organizationsRepository: OrganizationsRepository;
  contactsRepository: ContactsRepository;
}

export function createCreateContactController(params: CreateContactControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await createContact({
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        contactsRepository: params.contactsRepository,
      });

      response.status(201).json(presentContact(result));
    } catch (error) {
      next(error);
    }
  };
}
