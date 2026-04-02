import type { NextFunction, Request, Response } from "express";

import { getOrganization, type OrganizationsRepository } from "@film-set-app/domain-organizations";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentOrganization } from "../../presenters/organization.presenter.js";

interface GetOrganizationControllerParams {
  organizationsRepository: OrganizationsRepository;
}

export function createGetOrganizationController(params: GetOrganizationControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const organizationId = getRouteParam(request.params.organizationId, "organizationId");

      const result = await getOrganization({
        organizationId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
      });

      response.status(200).json(presentOrganization(result));
    } catch (error) {
      next(error);
    }
  };
}

function getRouteParam(value: string | string[] | undefined, fieldName: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  throw Object.assign(new Error(`${fieldName} route param is required`), { statusCode: 400 });
}
