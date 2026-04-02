import { Router } from "express";

import type { OrganizationsRepository } from "@film-set-app/domain-organizations";

import { createCreateOrganizationController } from "../controllers/organizations/create-organization.controller.js";
import { createGetOrganizationController } from "../controllers/organizations/get-organization.controller.js";

interface CreateOrganizationsRouterParams {
  organizationsRepository: OrganizationsRepository;
}

export function createOrganizationsRouter(params: CreateOrganizationsRouterParams) {
  const router = Router();

  router.post("/", createCreateOrganizationController(params));
  router.get("/:organizationId", createGetOrganizationController(params));

  return router;
}
