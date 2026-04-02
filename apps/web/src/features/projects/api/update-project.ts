import { apiRequest } from "@/lib/api-client";
import type { ProjectDto } from "@/lib/api-types";

interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
  status?: "draft" | "active" | "archived";
  startDate?: string | null;
  endDate?: string | null;
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<ProjectDto> {
  return apiRequest<ProjectDto>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

