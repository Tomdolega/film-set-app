import { apiRequest } from "@/lib/api-client";
import type { EquipmentDto } from "@/lib/api-types";

interface CreateEquipmentItemPayload {
  organizationId: string;
  name: string;
  category?: "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other";
  status?: "available" | "reserved" | "checked_out" | "maintenance" | "unavailable";
  description?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
}

export function createEquipmentItem(payload: CreateEquipmentItemPayload) {
  return apiRequest<EquipmentDto>("/equipment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
