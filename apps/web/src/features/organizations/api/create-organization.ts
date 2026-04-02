import { apiRequest } from "@/lib/api-client";
import type { OrganizationDto } from "@/lib/api-types";

interface CreateOrganizationPayload {
  name: string;
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<OrganizationDto> {
  return apiRequest<OrganizationDto>("/organizations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

