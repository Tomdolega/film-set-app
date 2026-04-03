import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import {
  exportShootingDayToCalendar,
  type CalendarProvider,
} from "@film-set-app/domain-integrations-calendar";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentExportedCalendarEvent } from "../../presenters/calendar.presenter.js";

interface ExportShootingDayToCalendarControllerParams {
  calendarProviders: CalendarProvider[];
  crewRepository: CrewRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createExportShootingDayToCalendarController(
  params: ExportShootingDayToCalendarControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const shootingDayId =
        typeof request.params.shootingDayId === "string" ? request.params.shootingDayId : "";
      const result = await exportShootingDayToCalendar({
        shootingDayId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        calendarProviders: params.calendarProviders,
        crewRepository: params.crewRepository,
        projectsRepository: params.projectsRepository,
        schedulingRepository: params.schedulingRepository,
      });

      response.status(200).json(presentExportedCalendarEvent(result));
    } catch (error) {
      next(error);
    }
  };
}
