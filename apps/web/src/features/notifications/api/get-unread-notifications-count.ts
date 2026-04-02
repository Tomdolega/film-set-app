import { apiRequest } from "@/lib/api-client";
import type { NotificationsUnreadCountDto } from "@/lib/api-types";

export async function getUnreadNotificationsCount(): Promise<number> {
  const response = await apiRequest<NotificationsUnreadCountDto>("/notifications/unread-count");
  return response.count;
}
