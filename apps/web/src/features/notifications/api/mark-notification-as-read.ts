import { apiRequest } from "@/lib/api-client";
import type { NotificationDto } from "@/lib/api-types";

export async function markNotificationAsRead(notificationId: string): Promise<NotificationDto> {
  return apiRequest<NotificationDto>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
