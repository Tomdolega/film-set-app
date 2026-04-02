import type { AccessRole } from "./assert-organization-access.js";

export interface ProjectAccessMembership {
  projectId: string;
  userId: string;
  role: AccessRole;
  createdAt: Date;
}

export interface ProjectAccessRepository {
  findProjectById: (projectId: string) => Promise<{ id: string } | null>;
  findProjectMember: (projectId: string, userId: string) => Promise<ProjectAccessMembership | null>;
}

interface StatusError extends Error {
  statusCode?: number;
}

export interface AssertProjectAccessParams {
  projectId: string;
  userId: string;
  repository: ProjectAccessRepository;
  requiredRoles?: AccessRole[];
}

export async function assertProjectAccess(
  params: AssertProjectAccessParams,
): Promise<ProjectAccessMembership> {
  const project = await params.repository.findProjectById(params.projectId);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await params.repository.findProjectMember(params.projectId, params.userId);

  if (!membership) {
    const error: StatusError = new Error("Project access denied");
    error.statusCode = 403;
    throw error;
  }

  if (params.requiredRoles && !params.requiredRoles.includes(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  return membership;
}
