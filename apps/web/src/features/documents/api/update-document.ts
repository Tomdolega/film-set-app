import type { DocumentDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

interface UpdateDocumentInput {
  name?: string;
  type?:
    | "general"
    | "call_sheet"
    | "crew_list"
    | "gear_list"
    | "schedule"
    | "notes"
    | "contract"
    | "invoice"
    | "other";
  description?: string | null;
}

export function updateDocument(documentId: string, input: UpdateDocumentInput) {
  return apiRequest<DocumentDto>(`/documents/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
