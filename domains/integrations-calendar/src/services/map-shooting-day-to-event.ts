import type { CallSheet, ShootingDay } from "@film-set-app/domain-scheduling";

import type { CalendarEvent } from "../types/calendar-event.js";

export interface MapShootingDayToEventParams {
  shootingDay: ShootingDay;
  projectName: string;
  callSheet: CallSheet;
}

export function mapShootingDayToEvent(
  params: MapShootingDayToEventParams,
): CalendarEvent {
  return {
    id: params.shootingDay.id,
    title: params.shootingDay.title,
    description: buildDescription(params.shootingDay, params.callSheet, params.projectName),
    startDateTime: `${params.shootingDay.date}T${params.shootingDay.startTime}:00.000Z`,
    endDateTime: `${params.shootingDay.date}T${params.shootingDay.endTime}:00.000Z`,
    location: params.shootingDay.location,
    attendees:
      params.callSheet.crew.length > 0
        ? params.callSheet.crew.map((entry) => `${entry.name} (${entry.callTime})`)
        : undefined,
    source: "internal",
  };
}

function buildDescription(
  shootingDay: ShootingDay,
  callSheet: CallSheet,
  projectName: string,
): string {
  const sections = [
    `Project: ${projectName}`,
    shootingDay.notes?.trim() || null,
    buildCrewSummary(callSheet),
  ].filter((value): value is string => Boolean(value));

  return sections.join("\n\n");
}

function buildCrewSummary(callSheet: CallSheet): string {
  if (callSheet.crew.length === 0) {
    return "Call sheet summary: no crew assigned yet.";
  }

  const crewEntries = callSheet.crew.map((entry) => `${entry.name} at ${entry.callTime}`);
  return `Call sheet summary: ${crewEntries.join(", ")}.`;
}
