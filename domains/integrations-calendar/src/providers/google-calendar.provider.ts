import { randomUUID } from "node:crypto";

import type { CalendarProvider } from "./calendar.provider.js";

export class GoogleCalendarProvider implements CalendarProvider {
  readonly providerName = "google" as const;

  async createEvent(event: {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    const externalEventId = `google_${randomUUID()}`;

    console.info(
      `[calendar/google] createEvent ${JSON.stringify({
        externalEventId,
        internalEventId: event.id,
        title: event.title,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
      })}`,
    );

    return {
      externalEventId,
    };
  }

  async updateEvent(event: {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    const externalEventId = event.id || `google_${randomUUID()}`;

    console.info(
      `[calendar/google] updateEvent ${JSON.stringify({
        externalEventId,
        title: event.title,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
      })}`,
    );

    return {
      externalEventId,
    };
  }

  async deleteEvent(eventId: string) {
    console.info(`[calendar/google] deleteEvent ${JSON.stringify({ eventId })}`);
  }
}
