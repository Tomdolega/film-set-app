import { Router } from "express";

import type { ContactsRepository } from "@film-set-app/domain-contacts";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import { createCreateContactController } from "../controllers/contacts/create-contact.controller.js";
import { createGetContactController } from "../controllers/contacts/get-contact.controller.js";
import { createListContactsController } from "../controllers/contacts/list-contacts.controller.js";
import { createUpdateContactController } from "../controllers/contacts/update-contact.controller.js";

interface CreateContactsRouterParams {
  organizationsRepository: OrganizationsRepository;
  contactsRepository: ContactsRepository;
}

export function createContactsRouter(params: CreateContactsRouterParams) {
  const router = Router();

  router.post("/", createCreateContactController(params));
  router.get("/", createListContactsController(params));
  router.get("/:contactId", createGetContactController(params));
  router.patch("/:contactId", createUpdateContactController(params));

  return router;
}
