import type { NextFunction, Request, Response } from "express";

import { listShootingDays, type SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentShootingDay } from "../../presenters/scheduling.presenter.js";

interface ListShootingDaysControllerParams {
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createListShootingDaysController(params: ListShootingDaysControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId = typeof request.params.projectId === "string" ? request.params.projectId : "";
      const result = await listShootingDays({
        projectId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(200).json(result.map(presentShootingDay));
    } catch (error) {
      next(error);
    }
  };
}
