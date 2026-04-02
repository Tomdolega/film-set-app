import type { CrewMemberDto } from "@/lib/api-types";
import { apiRequest } from "@/lib/api-client";

export function listProjectCrew(projectId: string) {
  return apiRequest<CrewMemberDto[]>(`/projects/${projectId}/crew`);
}
