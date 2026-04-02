import { apiRequest } from "@/lib/api-client";
import type { ShootingDayDto } from "@/lib/api-types";

export function getShootingDay(shootingDayId: string) {
  return apiRequest<ShootingDayDto>(`/shooting-days/${shootingDayId}`);
}
