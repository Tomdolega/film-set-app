import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewMember, CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayAssignment } from "../model/shooting-day.js";
import { canManageSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";
import { parseCreateShootingDayAssignmentInput } from "../schemas/shooting-day-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface AssignShootingDayResourceParams {
  shootingDayId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function assignShootingDayResource(
  params: AssignShootingDayResourceParams,
): Promise<ShootingDayAssignment> {
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

  const input = parseCreateShootingDayAssignmentInput(params.input);
  let assignedCrewMember: CrewMember | null = null;
  const existing = await params.schedulingRepository.findAssignmentByReference({
    shootingDayId: params.shootingDayId,
    type: input.type,
    referenceId: input.referenceId,
  });

  if (existing) {
    const error: StatusError = new Error("This resource is already assigned to the shooting day");
    error.statusCode = 400;
    throw error;
  }

  if (input.type === "crew") {
    const crewMember = await params.crewRepository.findCrewMemberById(input.referenceId);

    if (!crewMember || crewMember.projectId !== shootingDay.projectId) {
      const error: StatusError = new Error("Crew member not found in this project");
      error.statusCode = 400;
      throw error;
    }

    assignedCrewMember = crewMember;
  }

  if (input.type === "equipment") {
    const equipmentItem = await params.equipmentRepository.findEquipmentItemById(input.referenceId);

    if (!equipmentItem || equipmentItem.organizationId !== shootingDay.organizationId) {
      const error: StatusError = new Error("Equipment item not found in this organization");
      error.statusCode = 400;
      throw error;
    }

    if (equipmentItem.archivedAt) {
      const error: StatusError = new Error("Archived equipment cannot be assigned");
      error.statusCode = 400;
      throw error;
    }

    if (equipmentItem.status === "maintenance" || equipmentItem.status === "unavailable") {
      const error: StatusError = new Error("This equipment item is not currently assignable");
      error.statusCode = 400;
      throw error;
    }
  }

  const assignment = await params.schedulingRepository.createShootingDayAssignment({
    shootingDayId: shootingDay.id,
    projectId: shootingDay.projectId,
    organizationId: shootingDay.organizationId,
    type: input.type,
    referenceId: input.referenceId,
    label: input.label,
    callTime: input.callTime,
  });

  if (assignedCrewMember?.userId) {
    await params.notificationsRepository.createNotification({
      userId: assignedCrewMember.userId,
      organizationId: shootingDay.organizationId,
      projectId: shootingDay.projectId,
      type: "crew_assignment",
      severity: "info",
      title: "Assigned to shooting day",
      message: `You were assigned to "${shootingDay.title}" on ${shootingDay.date} at ${shootingDay.location}.`,
      linkPath: getShootingDayLinkPath(
        shootingDay.organizationId,
        shootingDay.projectId,
        shootingDay.id,
      ),
      relatedEntityType: "shooting_day_assignment",
      relatedEntityId: assignment.id,
    });
  }

  return assignment;
}

function getShootingDayLinkPath(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
) {
  return `/organizations/${organizationId}/projects/${projectId}/shooting-days/${shootingDayId}`;
}
