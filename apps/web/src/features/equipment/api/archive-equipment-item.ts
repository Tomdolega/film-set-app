import { apiRequest } from "@/lib/api-client";

export function archiveEquipmentItem(equipmentId: string) {
  return apiRequest<void>(`/equipment/${equipmentId}`, {
    method: "DELETE",
  });
}
