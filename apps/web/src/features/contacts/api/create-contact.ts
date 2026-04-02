import type { ContactDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

interface CreateContactInput {
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  type: "person" | "vendor" | "company";
}

export function createContact(input: CreateContactInput) {
  return apiRequest<ContactDto>("/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
