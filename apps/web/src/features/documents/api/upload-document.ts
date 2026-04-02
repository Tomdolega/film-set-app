import type { DocumentDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function uploadDocument(projectId: string, formData: FormData) {
  return apiRequest<DocumentDto>(`/projects/${projectId}/documents`, {
    method: "POST",
    body: formData,
  });
}
