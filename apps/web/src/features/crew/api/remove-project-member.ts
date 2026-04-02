import { apiRequest } from "@/lib/api-client";

export function removeProjectMember(projectId: string, projectMemberId: string) {
  return apiRequest<void>(`/projects/${projectId}/crew/${projectMemberId}`, {
    method: "DELETE",
  });
}
