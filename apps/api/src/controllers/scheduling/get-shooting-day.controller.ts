import type { NextFunction, Request, Response } from "express";

import { getShootingDay, type SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentShootingDay } from "../../presenters/scheduling.presenter.js";

interface GetShootingDayControllerParams {
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createGetShootingDayController(params: GetShootingDayControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const shootingDayId =
        typeof request.params.shootingDayId === "string" ? request.params.shootingDayId : "";
      const result = await getShootingDay({
        shootingDayId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(200).json(presentShootingDay(result));
    } catch (error) {
      next(error);
    }
  };
}
