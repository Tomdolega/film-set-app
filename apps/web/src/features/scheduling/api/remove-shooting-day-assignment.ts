import { apiRequest } from "@/lib/api-client";

export function removeShootingDayAssignment(shootingDayId: string, assignmentId: string) {
  return apiRequest<void>(`/shooting-days/${shootingDayId}/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}
