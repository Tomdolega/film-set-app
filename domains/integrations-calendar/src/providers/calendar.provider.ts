import type { CalendarEvent } from "../types/calendar-event.js";
import type {
  CalendarProviderCreateResult,
  CalendarProviderName,
  CalendarProviderUpdateResult,
} from "../types/calendar-provider.types.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CalendarProvider {
  providerName: CalendarProviderName;
  createEvent: (event: CalendarEvent) => Promise<CalendarProviderCreateResult>;
  updateEvent: (event: CalendarEvent) => Promise<CalendarProviderUpdateResult>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export function resolveCalendarProvider(params: {
  providerName: CalendarProviderName;
  providers: CalendarProvider[];
}): CalendarProvider {
  const provider = params.providers.find(
    (candidate) => candidate.providerName === params.providerName,
  );

  if (provider) {
    return provider;
  }

  const error: StatusError = new Error(
    `Calendar provider "${params.providerName}" is not configured`,
  );
  error.statusCode = 400;
  throw error;
}
