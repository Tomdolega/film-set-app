import { apiRequest } from "@/lib/api-client";
import type { NotificationDto } from "@/lib/api-types";

export async function listNotifications(): Promise<NotificationDto[]> {
  return apiRequest<NotificationDto[]>("/notifications");
}
