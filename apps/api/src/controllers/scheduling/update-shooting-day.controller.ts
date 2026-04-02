import type { NextFunction, Request, Response } from "express";

import { updateShootingDay, type SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentShootingDay } from "../../presenters/scheduling.presenter.js";

interface UpdateShootingDayControllerParams {
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createUpdateShootingDayController(params: UpdateShootingDayControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const shootingDayId =
        typeof request.params.shootingDayId === "string" ? request.params.shootingDayId : "";
      const result = await updateShootingDay({
        shootingDayId,
        input: request.body,
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
