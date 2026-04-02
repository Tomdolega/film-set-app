import type { NextFunction, Request, Response } from "express";

import { createOrganization, type OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentOrganization } from "../../presenters/organization.presenter.js";

interface CreateOrganizationControllerParams {
  organizationsRepository: OrganizationsRepository;
}

export function createCreateOrganizationController(params: CreateOrganizationControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await createOrganization({
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
      });

      response.status(201).json(presentOrganization(result));
    } catch (error) {
      next(error);
    }
  };
}
