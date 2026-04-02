import type { NextFunction, Request, Response } from "express";

import { updateProjectMember, type CrewRepository } from "@film-set-app/domain-crew";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentCrewMember } from "../../presenters/crew.presenter.js";

interface UpdateProjectMemberControllerParams {
  projectsRepository: ProjectsRepository;
  crewRepository: CrewRepository;
}

export function createUpdateProjectMemberController(params: UpdateProjectMemberControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId =
        typeof request.params.projectId === "string" ? request.params.projectId : "";
      const projectMemberId =
        typeof request.params.projectMemberId === "string" ? request.params.projectMemberId : "";

      const result = await updateProjectMember({
        projectId,
        projectMemberId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        crewRepository: params.crewRepository,
      });

      response.status(200).json(presentCrewMember(result));
    } catch (error) {
      next(error);
    }
  };
}
