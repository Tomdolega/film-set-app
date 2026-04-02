import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayWithMembership } from "../model/shooting-day.js";
import { canReadSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListShootingDaysParams {
  projectId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function listShootingDays(
  params: ListShootingDaysParams,
): Promise<ShootingDayWithMembership[]> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canReadSchedule(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const shootingDays = await params.schedulingRepository.listShootingDaysByProject(params.projectId);

  return shootingDays.map((shootingDay) => ({
    shootingDay,
    currentUserRole: membership.role,
  }));
}
