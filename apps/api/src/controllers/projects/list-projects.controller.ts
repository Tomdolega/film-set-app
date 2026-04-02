import type { NextFunction, Request, Response } from "express";

import type { OrganizationsRepository } from "@film-set-app/domain-organizations";
import { listProjects, type ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentProject } from "../../presenters/project.presenter.js";

interface ListProjectsControllerParams {
  organizationsRepository: OrganizationsRepository;
  projectsRepository: ProjectsRepository;
}

export function createListProjectsController(params: ListProjectsControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const organizationId =
        typeof request.query.organizationId === "string" ? request.query.organizationId : undefined;

      const result = await listProjects({
        organizationId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        projectsRepository: params.projectsRepository,
      });

      response.status(200).json(result.map(presentProject));
    } catch (error) {
      next(error);
    }
  };
}
