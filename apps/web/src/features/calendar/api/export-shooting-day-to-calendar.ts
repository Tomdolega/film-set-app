import { apiRequest } from "@/lib/api-client";
import type { ExportedCalendarEventDto } from "@/lib/api-types";

export async function exportShootingDayToCalendar(
  shootingDayId: string,
  payload: { provider?: "google" },
): Promise<ExportedCalendarEventDto> {
  return apiRequest<ExportedCalendarEventDto>(`/shooting-days/${shootingDayId}/export-calendar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
