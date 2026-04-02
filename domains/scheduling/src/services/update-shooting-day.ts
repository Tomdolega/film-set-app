import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import {
  createProjectMemberNotifications,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayWithMembership } from "../model/shooting-day.js";
import { canManageSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";
import { parseUpdateShootingDayInput } from "../schemas/shooting-day-schemas.js";
import { getShootingDayConflicts } from "./get-shooting-day-conflicts.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateShootingDayParams {
  shootingDayId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
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

  await createProjectMemberNotifications({
    projectId: updated.projectId,
    organizationId: updated.organizationId,
    type: "shooting_day_update",
    severity: "info",
    title: "Shooting day updated",
    message: `The shooting day on ${updated.date} at ${updated.location} was updated.`,
    linkPath: getShootingDayLinkPath(updated.organizationId, updated.projectId, updated.id),
    relatedEntityType: "shooting_day",
    relatedEntityId: updated.id,
    crewRepository: params.crewRepository,
    notificationsRepository: params.notificationsRepository,
  });

  const conflicts = await getShootingDayConflicts({
    shootingDayId: updated.id,
    sessionUser,
    crewRepository: params.crewRepository,
    equipmentRepository: params.equipmentRepository,
    projectsRepository: params.projectsRepository,
    schedulingRepository: params.schedulingRepository,
  });

  await Promise.all(
    conflicts.map((conflict) =>
      createProjectMemberNotifications({
        projectId: updated.projectId,
        organizationId: updated.organizationId,
        type: "schedule_conflict",
        severity: conflict.severity,
        title: conflict.severity === "conflict" ? "Schedule conflict detected" : "Schedule warning detected",
        message: conflict.message,
        linkPath: getShootingDayLinkPath(updated.organizationId, updated.projectId, updated.id),
        relatedEntityType: "shooting_day",
        relatedEntityId: conflict.relatedShootingDayId,
        crewRepository: params.crewRepository,
        notificationsRepository: params.notificationsRepository,
      }),
    ),
  );

  return {
    shootingDay: updated,
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
