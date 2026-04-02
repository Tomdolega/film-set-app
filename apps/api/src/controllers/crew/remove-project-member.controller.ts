import type { NextFunction, Request, Response } from "express";

import { removeProjectMember, type CrewRepository } from "@film-set-app/domain-crew";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

interface RemoveProjectMemberControllerParams {
  projectsRepository: ProjectsRepository;
  crewRepository: CrewRepository;
}

export function createRemoveProjectMemberController(params: RemoveProjectMemberControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId =
        typeof request.params.projectId === "string" ? request.params.projectId : "";
      const projectMemberId =
        typeof request.params.projectMemberId === "string" ? request.params.projectMemberId : "";

      await removeProjectMember({
        projectId,
        projectMemberId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        crewRepository: params.crewRepository,
      });

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
