import { apiRequest } from "@/lib/api-client";
import type { MarkAllNotificationsAsReadDto } from "@/lib/api-types";

export async function markAllNotificationsAsRead(): Promise<MarkAllNotificationsAsReadDto> {
  return apiRequest<MarkAllNotificationsAsReadDto>("/notifications/read-all", {
    method: "PATCH",
  });
}
