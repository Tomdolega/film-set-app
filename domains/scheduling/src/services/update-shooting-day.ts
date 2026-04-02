import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayWithMembership } from "../model/shooting-day.js";
import { canManageSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";
import { parseUpdateShootingDayInput } from "../schemas/shooting-day-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateShootingDayParams {
  shootingDayId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function updateShootingDay(
  params: UpdateShootingDayParams,
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

  if (!canManageSchedule(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const input = parseUpdateShootingDayInput(params.input);
  const startTime = input.startTime ?? shootingDay.startTime;
  const endTime = input.endTime ?? shootingDay.endTime;

  if (startTime >= endTime) {
    const error: StatusError = new Error("startTime must be earlier than endTime");
    error.statusCode = 400;
    throw error;
  }

  const updated = await params.schedulingRepository.updateShootingDay(params.shootingDayId, input);

  if (!updated) {
    const error: StatusError = new Error("Shooting day not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    shootingDay: updated,
    currentUserRole: membership.role,
  };
}
