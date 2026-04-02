import type { DocumentDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function getDocument(documentId: string) {
  return apiRequest<DocumentDto>(`/documents/${documentId}`);
}
