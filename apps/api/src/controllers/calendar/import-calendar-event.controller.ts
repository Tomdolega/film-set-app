import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import { importCalendarEvent } from "@film-set-app/domain-integrations-calendar";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentImportedCalendarEvent } from "../../presenters/calendar.presenter.js";

interface ImportCalendarEventControllerParams {
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createImportCalendarEventController(
  params: ImportCalendarEventControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await importCalendarEvent({
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        crewRepository: params.crewRepository,
        equipmentRepository: params.equipmentRepository,
        notificationsRepository: params.notificationsRepository,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(201).json(presentImportedCalendarEvent(result));
    } catch (error) {
      next(error);
    }
  };
}
