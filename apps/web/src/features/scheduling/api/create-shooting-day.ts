import { apiRequest } from "@/lib/api-client";
import type { ShootingDayDto } from "@/lib/api-types";

interface CreateShootingDayPayload {
  title: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  status?: "draft" | "locked";
}

export function createShootingDay(projectId: string, payload: CreateShootingDayPayload) {
  return apiRequest<ShootingDayDto>(`/projects/${projectId}/shooting-days`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
