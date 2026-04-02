import type { ContactDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function listContacts(organizationId: string) {
  const searchParams = new URLSearchParams({
    organizationId,
  });

  return apiRequest<ContactDto[]>(`/contacts?${searchParams.toString()}`);
}
