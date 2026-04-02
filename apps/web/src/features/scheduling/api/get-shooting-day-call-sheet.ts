import { apiRequest } from "@/lib/api-client";
import type { CallSheetDto } from "@/lib/api-types";

export function getShootingDayCallSheet(shootingDayId: string) {
  return apiRequest<CallSheetDto>(`/shooting-days/${shootingDayId}/call-sheet`);
}
