import type { NextFunction, Request, Response } from "express";

import { listOrganizations, type OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentOrganization } from "../../presenters/organization.presenter.js";

interface ListOrganizationsControllerParams {
  organizationsRepository: OrganizationsRepository;
}

export function createListOrganizationsController(params: ListOrganizationsControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await listOrganizations({
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
      });

      response.status(200).json(result.map(presentOrganization));
    } catch (error) {
      next(error);
    }
  };
}
