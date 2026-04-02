import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import {
  assignShootingDayResource,
  type SchedulingRepository,
} from "@film-set-app/domain-scheduling";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentShootingDayAssignment } from "../../presenters/scheduling.presenter.js";

interface AssignShootingDayResourceControllerParams {
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createAssignShootingDayResourceController(
  params: AssignShootingDayResourceControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const shootingDayId =
        typeof request.params.shootingDayId === "string" ? request.params.shootingDayId : "";
      const assignment = await assignShootingDayResource({
        shootingDayId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        crewRepository: params.crewRepository,
        equipmentRepository: params.equipmentRepository,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(201).json(presentShootingDayAssignment(assignment));
    } catch (error) {
      next(error);
    }
  };
}
