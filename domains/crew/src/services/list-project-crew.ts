import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { ProjectAccessRepository, SessionUser } from "@film-set-app/domain-auth";

import type { CrewMember } from "../model/crew-member.js";
import { canReadCrew } from "../permissions/crew.permissions.js";
import type { CrewRepository } from "../repositories/crew.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListProjectCrewParams {
  projectId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectAccessRepository;
  crewRepository: CrewRepository;
}

export async function listProjectCrew(params: ListProjectCrewParams): Promise<CrewMember[]> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canReadCrew(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  return params.crewRepository.listProjectCrew(params.projectId);
}
