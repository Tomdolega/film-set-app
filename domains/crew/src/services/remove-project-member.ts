import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { ProjectAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import { canManageCrew } from "../permissions/crew.permissions.js";
import type { CrewRepository } from "../repositories/crew.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface RemoveProjectMemberParams {
  projectId: string;
  projectMemberId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectAccessRepository;
  crewRepository: CrewRepository;
}

export async function removeProjectMember(params: RemoveProjectMemberParams): Promise<void> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageCrew(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const existingMember = await params.crewRepository.findCrewMemberById(params.projectMemberId);

  if (!existingMember || existingMember.projectId !== params.projectId) {
    const error: StatusError = new Error("Project crew member not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingMember.accessRole === "owner") {
    const ownerCount = await params.crewRepository.countCrewMembersByAccessRole(
      params.projectId,
      "owner",
    );

    if (ownerCount <= 1) {
      const error: StatusError = new Error("Project must keep at least one owner");
      error.statusCode = 400;
      throw error;
    }
  }

  await params.crewRepository.removeCrewMember(params.projectMemberId);
}
