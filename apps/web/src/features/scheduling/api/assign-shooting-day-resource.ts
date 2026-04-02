import { apiRequest } from "@/lib/api-client";
import type { ShootingDayAssignmentDto } from "@/lib/api-types";

interface AssignShootingDayResourcePayload {
  type: "crew" | "equipment";
  referenceId: string;
  label?: string | null;
  callTime?: string | null;
}

export function assignShootingDayResource(
  shootingDayId: string,
  payload: AssignShootingDayResourcePayload,
) {
  return apiRequest<ShootingDayAssignmentDto>(`/shooting-days/${shootingDayId}/assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
