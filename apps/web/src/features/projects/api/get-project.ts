import { apiRequest } from "@/lib/api-client";
import type { ProjectDto } from "@/lib/api-types";

export async function getProject(projectId: string): Promise<ProjectDto> {
  return apiRequest<ProjectDto>(`/projects/${projectId}`);
}

