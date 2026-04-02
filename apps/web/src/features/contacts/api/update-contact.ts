import type { ContactDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

interface UpdateContactInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags?: string[];
  type?: "person" | "vendor" | "company";
}

export function updateContact(contactId: string, input: UpdateContactInput) {
  return apiRequest<ContactDto>(`/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
