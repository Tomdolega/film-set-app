import { apiRequest } from "@/lib/api-client";
import type { OrganizationDto } from "@/lib/api-types";

export async function listOrganizations(): Promise<OrganizationDto[]> {
  return apiRequest<OrganizationDto[]>("/organizations");
}
