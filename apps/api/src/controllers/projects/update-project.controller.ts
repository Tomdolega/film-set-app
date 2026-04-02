import type { NextFunction, Request, Response } from "express";

import { updateProject, type ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentProject } from "../../presenters/project.presenter.js";

interface UpdateProjectControllerParams {
  projectsRepository: ProjectsRepository;
}

export function createUpdateProjectController(params: UpdateProjectControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId = getRouteParam(request.params.projectId, "projectId");

      const result = await updateProject({
        projectId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
      });

      response.status(200).json(presentProject(result));
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
