import { apiRequest } from "@/lib/api-client";
import type { EquipmentDto } from "@/lib/api-types";

interface UpdateEquipmentItemPayload {
  name?: string;
  category?: "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other";
  status?: "available" | "reserved" | "checked_out" | "maintenance" | "unavailable";
  description?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
}

export function updateEquipmentItem(
  equipmentId: string,
  payload: UpdateEquipmentItemPayload,
) {
  return apiRequest<EquipmentDto>(`/equipment/${equipmentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
