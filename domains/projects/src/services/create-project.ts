import { assertOrganizationAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { OrganizationAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { ProjectWithMembership } from "../model/project.js";
import { parseCreateProjectInput } from "../schemas/project-schemas.js";
import type { ProjectsRepository } from "../repositories/projects.repository.js";

export interface CreateProjectParams {
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  organizationsRepository: OrganizationAccessRepository;
  projectsRepository: ProjectsRepository;
}

export async function createProject(params: CreateProjectParams): Promise<ProjectWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const input = parseCreateProjectInput(params.input);

  await assertOrganizationAccess({
    organizationId: input.organizationId,
    userId: sessionUser.id,
    repository: params.organizationsRepository,
    requiredRoles: ["owner", "admin"],
  });

  const project = await params.projectsRepository.createProject({
    organizationId: input.organizationId,
    name: input.name,
    description: input.description ?? null,
    status: "draft",
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    createdByUserId: sessionUser.id,
  });

  const membership = await params.projectsRepository.addProjectMember({
    projectId: project.id,
    userId: sessionUser.id,
    role: "owner",
  });

  return { project, membership };
}
