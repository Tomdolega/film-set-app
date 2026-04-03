import type {
  CalendarEvent,
  ExportedCalendarEvent,
  ImportedCalendarEventResult,
} from "@film-set-app/domain-integrations-calendar";

import { presentScheduleConflict, presentShootingDay } from "./scheduling.presenter.js";

export function presentCalendarEvent(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location,
    attendees: event.attendees ?? [],
    source: event.source,
  };
}

export function presentExportedCalendarEvent(result: ExportedCalendarEvent) {
  return {
    provider: result.provider,
    externalEventId: result.externalEventId,
    event: presentCalendarEvent(result.event),
  };
}

export function presentImportedCalendarEvent(result: ImportedCalendarEventResult) {
  return {
    event: presentCalendarEvent(result.event),
    shootingDay: presentShootingDay(result.shootingDay),
    conflicts: result.conflicts.map(presentScheduleConflict),
  };
}
