import type { ContactDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function getContact(contactId: string) {
  return apiRequest<ContactDto>(`/contacts/${contactId}`);
}
