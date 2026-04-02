import type { DocumentDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function listProjectDocuments(projectId: string) {
  return apiRequest<DocumentDto[]>(`/projects/${projectId}/documents`);
}
