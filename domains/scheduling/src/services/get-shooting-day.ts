import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayWithMembership } from "../model/shooting-day.js";
import { canReadSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetShootingDayParams {
  shootingDayId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function getShootingDay(
  params: GetShootingDayParams,
): Promise<ShootingDayWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const shootingDay = await params.schedulingRepository.findShootingDayById(params.shootingDayId);

  if (!shootingDay) {
    const error: StatusError = new Error("Shooting day not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertProjectAccess({
    projectId: shootingDay.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canReadSchedule(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  return {
    shootingDay,
    currentUserRole: membership.role,
  };
}
