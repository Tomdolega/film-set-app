import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import { createShootingDay, type SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentShootingDay } from "../../presenters/scheduling.presenter.js";

interface CreateShootingDayControllerParams {
  crewRepository: CrewRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createCreateShootingDayController(params: CreateShootingDayControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId = typeof request.params.projectId === "string" ? request.params.projectId : "";
      const result = await createShootingDay({
        projectId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        crewRepository: params.crewRepository,
        notificationsRepository: params.notificationsRepository,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(201).json(presentShootingDay(result));
    } catch (error) {
      next(error);
    }
  };
}
