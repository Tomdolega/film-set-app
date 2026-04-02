import { apiRequest } from "@/lib/api-client";
import type { ScheduleConflictDto } from "@/lib/api-types";

export function getShootingDayConflicts(shootingDayId: string) {
  return apiRequest<ScheduleConflictDto[]>(`/shooting-days/${shootingDayId}/conflicts`);
}
