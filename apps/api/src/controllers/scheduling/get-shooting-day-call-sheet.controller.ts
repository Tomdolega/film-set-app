import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import {
  getShootingDayCallSheet,
  type SchedulingRepository,
} from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentCallSheet } from "../../presenters/scheduling.presenter.js";

interface GetShootingDayCallSheetControllerParams {
  crewRepository: CrewRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createGetShootingDayCallSheetController(
  params: GetShootingDayCallSheetControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const shootingDayId =
        typeof request.params.shootingDayId === "string" ? request.params.shootingDayId : "";
      const callSheet = await getShootingDayCallSheet({
        shootingDayId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        crewRepository: params.crewRepository,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(200).json(presentCallSheet(callSheet));
    } catch (error) {
      next(error);
    }
  };
}
