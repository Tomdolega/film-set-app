import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";

import { canManageProject } from "../permissions/projects.permissions.js";
import type { ProjectWithMembership } from "../model/project.js";
import { assertProjectDateRange, parseUpdateProjectInput } from "../schemas/project-schemas.js";
import type { ProjectsRepository } from "../repositories/projects.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateProjectParams {
  projectId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
}

export async function updateProject(params: UpdateProjectParams): Promise<ProjectWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageProject(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const existingProject = await params.projectsRepository.findProjectById(params.projectId);

  if (!existingProject) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const input = parseUpdateProjectInput(params.input);
  const startDate = input.startDate === undefined ? existingProject.startDate : input.startDate;
  const endDate = input.endDate === undefined ? existingProject.endDate : input.endDate;

  assertProjectDateRange(startDate, endDate);
  const project = await params.projectsRepository.updateProject(params.projectId, input);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return { project, membership };
}
