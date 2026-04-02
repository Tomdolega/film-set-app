import type { CrewMemberDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

interface AddProjectMemberInput {
  userId?: string | null;
  contactId?: string | null;
  accessRole?: "owner" | "admin" | "member";
  projectRole?: string | null;
}

export function addProjectMember(projectId: string, input: AddProjectMemberInput) {
  return apiRequest<CrewMemberDto>(`/projects/${projectId}/crew`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
