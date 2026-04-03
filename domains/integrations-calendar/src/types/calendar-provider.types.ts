import type { CalendarEvent } from "./calendar-event.js";

export type CalendarProviderName = "google";

export interface CalendarProviderCreateResult {
  externalEventId: string;
}

export interface CalendarProviderUpdateResult {
  externalEventId: string;
}

export interface ExportedCalendarEvent {
  provider: CalendarProviderName;
  externalEventId: string;
  event: CalendarEvent;
}

interface StatusError extends Error {
  statusCode?: number;
}

export function parseCalendarProviderName(
  value: unknown,
  fallback: CalendarProviderName = "google",
): CalendarProviderName {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (value === "google") {
    return value;
  }

  const error: StatusError = new Error('provider must be "google"');
  error.statusCode = 400;
  throw error;
}
