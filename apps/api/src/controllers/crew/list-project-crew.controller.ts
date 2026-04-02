import type { NextFunction, Request, Response } from "express";

import { listProjectCrew, type CrewRepository } from "@film-set-app/domain-crew";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentCrewMember } from "../../presenters/crew.presenter.js";

interface ListProjectCrewControllerParams {
  projectsRepository: ProjectsRepository;
  crewRepository: CrewRepository;
}

export function createListProjectCrewController(params: ListProjectCrewControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId =
        typeof request.params.projectId === "string" ? request.params.projectId : "";

      const result = await listProjectCrew({
        projectId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        crewRepository: params.crewRepository,
      });

      response.status(200).json(result.map(presentCrewMember));
    } catch (error) {
      next(error);
    }
  };
}
