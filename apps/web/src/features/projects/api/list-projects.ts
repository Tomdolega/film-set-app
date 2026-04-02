import { apiRequest } from "@/lib/api-client";
import type { ProjectDto } from "@/lib/api-types";

export async function listProjects(organizationId: string): Promise<ProjectDto[]> {
  return apiRequest<ProjectDto[]>(`/projects?organizationId=${organizationId}`);
}

