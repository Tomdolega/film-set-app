import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import { getProject, type ProjectsRepository } from "@film-set-app/domain-projects";
import {
  createShootingDay,
  getShootingDayConflicts,
  type ScheduleConflict,
  type SchedulingRepository,
  type ShootingDayWithMembership,
} from "@film-set-app/domain-scheduling";

import type { CalendarEvent } from "../types/calendar-event.js";
import { parseCalendarEvent } from "../types/calendar-event.js";
import { mapEventToShootingDay } from "./map-event-to-shooting-day.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ImportCalendarEventInput {
  projectId: string;
  organizationId: string;
  event: unknown;
}

export interface ImportedCalendarEventResult {
  event: CalendarEvent;
  shootingDay: ShootingDayWithMembership;
  conflicts: ScheduleConflict[];
}

export interface ImportCalendarEventParams {
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function importCalendarEvent(
  params: ImportCalendarEventParams,
): Promise<ImportedCalendarEventResult> {
  const input = parseImportCalendarEventInput(params.input);
  const event = parseCalendarEvent(input.event);
  const projectResult = await getProject({
    projectId: input.projectId,
    sessionUser: params.sessionUser,
    projectsRepository: params.projectsRepository,
  });

  if (projectResult.project.organizationId !== input.organizationId) {
    const error: StatusError = new Error(
      "The project does not belong to the provided organization",
    );
    error.statusCode = 400;
    throw error;
  }

  const shootingDayInput = mapEventToShootingDay(event);
  const existingShootingDays = await params.schedulingRepository.listShootingDaysByProject(
    input.projectId,
  );
  const duplicate = existingShootingDays.find(
    (shootingDay) =>
      shootingDay.title === shootingDayInput.title &&
      shootingDay.date === shootingDayInput.date &&
      shootingDay.location === shootingDayInput.location &&
      shootingDay.startTime === shootingDayInput.startTime &&
      shootingDay.endTime === shootingDayInput.endTime,
  );

  if (duplicate) {
    const error: StatusError = new Error(
      "A matching shooting day already exists for this imported event",
    );
    error.statusCode = 409;
    throw error;
  }

  const shootingDay = await createShootingDay({
    projectId: input.projectId,
    input: shootingDayInput,
    sessionUser: params.sessionUser,
    crewRepository: params.crewRepository,
    notificationsRepository: params.notificationsRepository,
    projectsRepository: params.projectsRepository,
    schedulingRepository: params.schedulingRepository,
  });
  const conflicts = await getShootingDayConflicts({
    shootingDayId: shootingDay.shootingDay.id,
    sessionUser: params.sessionUser,
    crewRepository: params.crewRepository,
    equipmentRepository: params.equipmentRepository,
    projectsRepository: params.projectsRepository,
    schedulingRepository: params.schedulingRepository,
  });

  return {
    event,
    shootingDay,
    conflicts,
  };
}

function parseImportCalendarEventInput(input: unknown): ImportCalendarEventInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw createValidationError("Request body must be an object");
  }

  const record = input as Record<string, unknown>;

  return {
    projectId: parseRequiredString(record.projectId, "projectId is required"),
    organizationId: parseRequiredString(record.organizationId, "organizationId is required"),
    event: record.event,
  };
}

function parseRequiredString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    throw createValidationError(message);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw createValidationError(message);
  }

  return trimmed;
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
