import type { NextFunction, Request, Response } from "express";

import {
  removeShootingDayAssignment,
  type SchedulingRepository,
} from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

interface RemoveShootingDayAssignmentControllerParams {
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createRemoveShootingDayAssignmentController(
  params: RemoveShootingDayAssignmentControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const assignmentId =
        typeof request.params.assignmentId === "string" ? request.params.assignmentId : "";
      await removeShootingDayAssignment({
        assignmentId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
