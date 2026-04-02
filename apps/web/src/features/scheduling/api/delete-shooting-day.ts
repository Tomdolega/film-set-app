import { apiRequest } from "@/lib/api-client";

export function deleteShootingDay(shootingDayId: string) {
  return apiRequest<void>(`/shooting-days/${shootingDayId}`, {
    method: "DELETE",
  });
}
