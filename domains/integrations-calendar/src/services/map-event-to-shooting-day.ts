import type { CreateShootingDayInput } from "@film-set-app/domain-scheduling";

import type { CalendarEvent } from "../types/calendar-event.js";

interface StatusError extends Error {
  statusCode?: number;
}

export function mapEventToShootingDay(event: CalendarEvent): CreateShootingDayInput {
  const start = parseCalendarDateTime(event.startDateTime);
  const end = parseCalendarDateTime(event.endDateTime);

  if (start.date !== end.date) {
    const error: StatusError = new Error(
      "Multi-day calendar events cannot be imported into a single shooting day",
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    title: event.title,
    date: start.date,
    location: event.location.trim() || "Imported calendar event",
    startTime: start.time,
    endTime: end.time,
    notes: buildImportedNotes(event),
    status: "draft",
  };
}

function buildImportedNotes(event: CalendarEvent): string {
  const sections = [
    "Imported from calendar.",
    `Calendar source: ${event.source}.`,
    event.description?.trim() ? `Calendar description: ${event.description.trim()}` : null,
    event.attendees && event.attendees.length > 0
      ? `Calendar attendees: ${event.attendees.join(", ")}`
      : null,
  ].filter((value): value is string => Boolean(value));

  return sections.join("\n");
}

function parseCalendarDateTime(value: string): { date: string; time: string } {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);

  if (!match) {
    const error: StatusError = new Error(
      "Calendar event date-times must include YYYY-MM-DDTHH:MM",
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    date: match[1],
    time: match[2],
  };
}
