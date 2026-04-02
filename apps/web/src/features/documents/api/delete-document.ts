import { apiRequest } from "@/lib/api-client";

export function deleteDocument(documentId: string) {
  return apiRequest<void>(`/documents/${documentId}`, {
    method: "DELETE",
  });
}
