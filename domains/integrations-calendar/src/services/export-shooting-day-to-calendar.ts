import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import {
  getShootingDay,
  getShootingDayCallSheet,
  type SchedulingRepository,
} from "@film-set-app/domain-scheduling";

import {
  resolveCalendarProvider,
  type CalendarProvider,
} from "../providers/calendar.provider.js";
import {
  parseCalendarProviderName,
  type ExportedCalendarEvent,
} from "../types/calendar-provider.types.js";
import { mapShootingDayToEvent } from "./map-shooting-day-to-event.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ExportShootingDayToCalendarParams {
  shootingDayId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  calendarProviders: CalendarProvider[];
  crewRepository: CrewRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function exportShootingDayToCalendar(
  params: ExportShootingDayToCalendarParams,
): Promise<ExportedCalendarEvent> {
  const providerName = parseExportProvider(params.input);
  const shootingDayResult = await getShootingDay({
    shootingDayId: params.shootingDayId,
    sessionUser: params.sessionUser,
    projectsRepository: params.projectsRepository,
    schedulingRepository: params.schedulingRepository,
  });
  const project = await params.projectsRepository.findProjectById(
    shootingDayResult.shootingDay.projectId,
  );

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const callSheet = await getShootingDayCallSheet({
    shootingDayId: params.shootingDayId,
    sessionUser: params.sessionUser,
    crewRepository: params.crewRepository,
    projectsRepository: params.projectsRepository,
    schedulingRepository: params.schedulingRepository,
  });
  const provider = resolveCalendarProvider({
    providerName,
    providers: params.calendarProviders,
  });
  const event = mapShootingDayToEvent({
    shootingDay: shootingDayResult.shootingDay,
    projectName: project.name,
    callSheet,
  });
  const created = await provider.createEvent(event);

  return {
    provider: providerName,
    externalEventId: created.externalEventId,
    event,
  };
}

function parseExportProvider(input: unknown) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return parseCalendarProviderName(undefined);
  }

  const record = input as Record<string, unknown>;
  return parseCalendarProviderName(record.provider);
}
