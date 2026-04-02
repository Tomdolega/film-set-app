import { apiRequest } from "@/lib/api-client";
import type { EquipmentDto } from "@/lib/api-types";

export function listEquipmentItems(organizationId: string) {
  const searchParams = new URLSearchParams({
    organizationId,
  });

  return apiRequest<EquipmentDto[]>(`/equipment?${searchParams.toString()}`);
}
