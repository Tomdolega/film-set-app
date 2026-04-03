import { apiRequest } from "@/lib/api-client";
import type { CalendarEventDto, ImportedCalendarEventDto } from "@/lib/api-types";

interface ImportCalendarEventPayload {
  projectId: string;
  organizationId: string;
  event: CalendarEventDto;
}

export async function importCalendarEvent(
  payload: ImportCalendarEventPayload,
): Promise<ImportedCalendarEventDto> {
  return apiRequest<ImportedCalendarEventDto>("/calendar/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
