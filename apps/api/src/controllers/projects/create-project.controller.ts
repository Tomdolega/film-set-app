import type { NextFunction, Request, Response } from "express";

import type { OrganizationsRepository } from "@film-set-app/domain-organizations";
import { createProject, type ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentProject } from "../../presenters/project.presenter.js";

interface CreateProjectControllerParams {
  organizationsRepository: OrganizationsRepository;
  projectsRepository: ProjectsRepository;
}

export function createCreateProjectController(params: CreateProjectControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await createProject({
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        organizationsRepository: params.organizationsRepository,
        projectsRepository: params.projectsRepository,
      });

      response.status(201).json(presentProject(result));
    } catch (error) {
      next(error);
    }
  };
}
