import type { NextFunction, Request, Response } from "express";

import { addProjectMember, type CrewRepository, type UserLookupRepository } from "@film-set-app/domain-crew";
import type { ContactsRepository } from "@film-set-app/domain-contacts";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentCrewMember } from "../../presenters/crew.presenter.js";

interface AddProjectMemberControllerParams {
  usersRepository: UserLookupRepository;
  organizationsRepository: OrganizationsRepository;
  projectsRepository: ProjectsRepository;
  contactsRepository: ContactsRepository;
  crewRepository: CrewRepository;
}

export function createAddProjectMemberController(params: AddProjectMemberControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId =
        typeof request.params.projectId === "string" ? request.params.projectId : "";

      const result = await addProjectMember({
        projectId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        usersRepository: params.usersRepository,
        organizationsRepository: params.organizationsRepository,
        projectsRepository: params.projectsRepository,
        contactsRepository: params.contactsRepository,
        crewRepository: params.crewRepository,
      });

      response.status(201).json(presentCrewMember(result));
    } catch (error) {
      next(error);
    }
  };
}
