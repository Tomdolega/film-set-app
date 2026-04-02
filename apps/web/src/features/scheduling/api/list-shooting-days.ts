import { apiRequest } from "@/lib/api-client";
import type { ShootingDayDto } from "@/lib/api-types";

export function listShootingDays(projectId: string) {
  return apiRequest<ShootingDayDto[]>(`/projects/${projectId}/shooting-days`);
}
