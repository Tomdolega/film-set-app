import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import {
  createProjectMemberNotifications,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";
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
  crewRepository: CrewRepository;
  notificationsRepository: NotificationsRepository;
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

  await createProjectMemberNotifications({
    projectId: project.id,
    organizationId: project.organizationId,
    type: "shooting_day_update",
    severity: "info",
    title: "Shooting day created",
    message: `A shooting day for ${shootingDay.date} was created at ${shootingDay.location}.`,
    linkPath: getShootingDayLinkPath(project.organizationId, project.id, shootingDay.id),
    relatedEntityType: "shooting_day",
    relatedEntityId: shootingDay.id,
    crewRepository: params.crewRepository,
    notificationsRepository: params.notificationsRepository,
  });

  return {
    shootingDay,
    currentUserRole: membership.role,
  };
}

function getShootingDayLinkPath(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
) {
  return `/organizations/${organizationId}/projects/${projectId}/shooting-days/${shootingDayId}`;
}
