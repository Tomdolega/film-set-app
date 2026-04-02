import { apiRequest } from "@/lib/api-client";
import type { ShootingDayAssignmentDto } from "@/lib/api-types";

export function listShootingDayAssignments(shootingDayId: string) {
  return apiRequest<ShootingDayAssignmentDto[]>(`/shooting-days/${shootingDayId}/assignments`);
}
