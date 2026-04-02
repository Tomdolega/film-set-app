import { apiRequest } from "@/lib/api-client";
import type { ProjectDto } from "@/lib/api-types";

interface CreateProjectPayload {
  organizationId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectDto> {
  return apiRequest<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

