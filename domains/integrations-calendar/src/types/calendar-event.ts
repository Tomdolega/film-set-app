export type CalendarEventSource = "google" | "internal";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  location: string;
  attendees?: string[];
  source: CalendarEventSource;
}

interface StatusError extends Error {
  statusCode?: number;
}

export function parseCalendarEvent(input: unknown): CalendarEvent {
  const record = parseRecord(input);

  return {
    id: parseRequiredString(record.id, "event.id is required"),
    title: parseRequiredString(record.title, "event.title is required"),
    description: parseOptionalString(record.description),
    startDateTime: parseDateTime(record.startDateTime, "event.startDateTime is required"),
    endDateTime: parseDateTime(record.endDateTime, "event.endDateTime is required"),
    location: parseRequiredString(record.location, "event.location is required"),
    attendees: parseAttendees(record.attendees),
    source: parseSource(record.source),
  };
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw createValidationError("Calendar event payload must be an object");
  }

  return input as Record<string, unknown>;
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

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("Calendar event fields must be strings");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseDateTime(value: unknown, message: string): string {
  const dateTime = parseRequiredString(value, message);

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateTime) || Number.isNaN(Date.parse(dateTime))) {
    throw createValidationError("Calendar event date-times must use ISO-8601 format");
  }

  return dateTime;
}

function parseAttendees(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw createValidationError("event.attendees must be an array of strings");
  }

  const attendees = value.map((entry) => parseRequiredString(entry, "event.attendees must be strings"));
  return attendees.length > 0 ? attendees : undefined;
}

function parseSource(value: unknown): CalendarEventSource {
  if (value === undefined || value === null || value === "") {
    return "google";
  }

  if (value === "google" || value === "internal") {
    return value;
  }

  throw createValidationError('event.source must be "google" or "internal"');
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
