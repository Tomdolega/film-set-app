import { apiRequest } from "@/lib/api-client";
import type { ShootingDayDto } from "@/lib/api-types";

interface UpdateShootingDayPayload {
  date?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
  status?: "draft" | "locked";
}

export function updateShootingDay(shootingDayId: string, payload: UpdateShootingDayPayload) {
  return apiRequest<ShootingDayDto>(`/shooting-days/${shootingDayId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
