import type { CrewMemberDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

interface UpdateProjectMemberInput {
  accessRole?: "owner" | "admin" | "member";
  projectRole?: string | null;
}

export function updateProjectMember(projectId: string, projectMemberId: string, input: UpdateProjectMemberInput) {
  return apiRequest<CrewMemberDto>(`/projects/${projectId}/crew/${projectMemberId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
