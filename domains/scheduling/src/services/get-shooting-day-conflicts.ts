import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ScheduleConflict, ShootingDay, ShootingDayAssignment } from "../model/shooting-day.js";
import { canReadSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetShootingDayConflictsParams {
  shootingDayId: string;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function getShootingDayConflicts(
  params: GetShootingDayConflictsParams,
): Promise<ScheduleConflict[]> {
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

  const [shootingDays, assignments, crew] = await Promise.all([
    params.schedulingRepository.listShootingDaysByProject(shootingDay.projectId),
    params.schedulingRepository.listAssignmentsByProject(shootingDay.projectId),
    params.crewRepository.listProjectCrew(shootingDay.projectId),
  ]);
  const crewById = new Map(crew.map((member) => [member.id, member]));
  const equipmentIds = Array.from(
    new Set(
      assignments.filter((assignment) => assignment.type === "equipment").map((assignment) => assignment.referenceId),
    ),
  );
  const equipmentEntries = await Promise.all(
    equipmentIds.map(
      async (equipmentId): Promise<[string, Awaited<ReturnType<EquipmentLookupRepository["findEquipmentItemById"]>>]> => [
        equipmentId,
        await params.equipmentRepository.findEquipmentItemById(equipmentId),
      ],
    ),
  );
  const equipmentById = new Map<string, Awaited<ReturnType<EquipmentLookupRepository["findEquipmentItemById"]>>>(
    equipmentEntries,
  );
  const assignmentsByDayId = new Map<string, ShootingDayAssignment[]>();

  for (const assignment of assignments) {
    const dayAssignments = assignmentsByDayId.get(assignment.shootingDayId) ?? [];
    dayAssignments.push(assignment);
    assignmentsByDayId.set(assignment.shootingDayId, dayAssignments);
  }

  const overlappingDays = shootingDays.filter(
    (candidate) => candidate.id !== shootingDay.id && doShootingDaysOverlap(shootingDay, candidate),
  );
  const conflicts: ScheduleConflict[] = [];

  for (const candidate of overlappingDays) {
    conflicts.push({
      type: "time_overlap",
      severity: "warning",
      message: `Overlaps with shooting day on ${candidate.date} from ${candidate.startTime} to ${candidate.endTime}.`,
      relatedEntityId: candidate.id,
      relatedShootingDayId: candidate.id,
    });
  }

  const currentAssignments = assignmentsByDayId.get(shootingDay.id) ?? [];

  for (const assignment of currentAssignments) {
    for (const candidate of overlappingDays) {
      const candidateAssignments = assignmentsByDayId.get(candidate.id) ?? [];

      for (const candidateAssignment of candidateAssignments) {
        if (
          candidateAssignment.type !== assignment.type ||
          candidateAssignment.referenceId !== assignment.referenceId
        ) {
          continue;
        }

        if (assignment.type === "crew") {
          const crewMember = crewById.get(assignment.referenceId);
          const resourceName = crewMember?.name ?? assignment.label ?? "Crew member";

          conflicts.push({
            type: "crew_conflict",
            severity: "conflict",
            message: `${resourceName} is already assigned to another overlapping shooting day on ${candidate.date}.`,
            relatedEntityId: candidateAssignment.id,
            relatedShootingDayId: candidate.id,
          });
          continue;
        }

        const equipmentItem = equipmentById.get(assignment.referenceId);
        const resourceName =
          assignment.label ??
          candidateAssignment.label ??
          equipmentItem?.name ??
          assignment.referenceId;

        conflicts.push({
          type: "equipment_conflict",
          severity: "conflict",
          message: `${resourceName} is already assigned to another overlapping shooting day on ${candidate.date}.`,
          relatedEntityId: candidateAssignment.id,
          relatedShootingDayId: candidate.id,
        });
      }
    }
  }

  return conflicts;
}

function doShootingDaysOverlap(left: ShootingDay, right: ShootingDay): boolean {
  return (
    createWindowStart(left) < createWindowEnd(right) &&
    createWindowStart(right) < createWindowEnd(left)
  );
}

function createWindowStart(shootingDay: ShootingDay): number {
  return Date.parse(`${shootingDay.date}T${shootingDay.startTime}:00.000Z`);
}

function createWindowEnd(shootingDay: ShootingDay): number {
  return Date.parse(`${shootingDay.date}T${shootingDay.endTime}:00.000Z`);
}
