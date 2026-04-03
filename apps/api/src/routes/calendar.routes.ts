import { Router } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { CalendarProvider } from "@film-set-app/domain-integrations-calendar";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";

import { createImportCalendarEventController } from "../controllers/calendar/import-calendar-event.controller.js";

interface CreateCalendarRouterParams {
  calendarProviders: CalendarProvider[];
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createCalendarRouter(params: CreateCalendarRouterParams) {
  const router = Router();

  router.post("/import", createImportCalendarEventController(params));

  return router;
}
