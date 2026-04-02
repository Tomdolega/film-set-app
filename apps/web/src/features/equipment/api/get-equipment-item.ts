import { apiRequest } from "@/lib/api-client";
import type { EquipmentDto } from "@/lib/api-types";

export function getEquipmentItem(equipmentId: string) {
  return apiRequest<EquipmentDto>(`/equipment/${equipmentId}`);
}
