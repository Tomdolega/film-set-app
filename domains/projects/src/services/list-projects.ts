import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ProjectWithMembership } from "../model/project.js";
import type { ProjectsRepository } from "../repositories/projects.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListProjectsParams {
  organizationId: string | undefined;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  projectsRepository: ProjectsRepository;
}

export async function listProjects(params: ListProjectsParams): Promise<ProjectWithMembership[]> {
  const sessionUser = getSessionUser(params.sessionUser);

  if (!params.organizationId?.trim()) {
    const error: StatusError = new Error("organizationId is required");
    error.statusCode = 400;
    throw error;
  }

  await assertOrganizationAccess({
    organizationId: params.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
  });

  return params.projectsRepository.listProjectsForUser({
    organizationId: params.organizationId,
    userId: sessionUser.id,
  });
}
