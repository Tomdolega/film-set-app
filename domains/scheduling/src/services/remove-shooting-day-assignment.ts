import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import { canManageSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface RemoveShootingDayAssignmentParams {
  assignmentId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function removeShootingDayAssignment(
  params: RemoveShootingDayAssignmentParams,
): Promise<void> {
  const sessionUser = getSessionUser(params.sessionUser);
  const assignment = await params.schedulingRepository.findAssignmentById(params.assignmentId);

  if (!assignment) {
    const error: StatusError = new Error("Assignment not found");
    error.statusCode = 404;
    throw error;
  }

  const shootingDay = await params.schedulingRepository.findShootingDayById(assignment.shootingDayId);

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

  await params.schedulingRepository.deleteAssignment(params.assignmentId);
}
