import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";

import { canReadProject } from "../permissions/projects.permissions.js";
import type { ProjectWithMembership } from "../model/project.js";
import type { ProjectsRepository } from "../repositories/projects.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetProjectParams {
  projectId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
}

export async function getProject(params: GetProjectParams): Promise<ProjectWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canReadProject(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const project = await params.projectsRepository.findProjectById(params.projectId);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return { project, membership };
}
