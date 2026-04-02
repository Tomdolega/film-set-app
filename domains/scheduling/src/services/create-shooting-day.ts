import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import { canManageSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";
import { parseCreateShootingDayInput } from "../schemas/shooting-day-schemas.js";
import type { ShootingDayWithMembership } from "../model/shooting-day.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateShootingDayParams {
  projectId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function createShootingDay(
  params: CreateShootingDayParams,
): Promise<ShootingDayWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageSchedule(membership.role)) {
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

  const input = parseCreateShootingDayInput(params.input);
  const shootingDay = await params.schedulingRepository.createShootingDay({
    projectId: params.projectId,
    organizationId: project.organizationId,
    date: input.date,
    location: input.location,
    startTime: input.startTime,
    endTime: input.endTime,
    notes: input.notes,
    status: input.status,
  });

  return {
    shootingDay,
    currentUserRole: membership.role,
  };
}
