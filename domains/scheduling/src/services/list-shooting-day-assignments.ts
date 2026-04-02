import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { ShootingDayAssignmentWithDetails } from "../model/shooting-day.js";
import { canReadSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListShootingDayAssignmentsParams {
  shootingDayId: string;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  equipmentRepository: EquipmentLookupRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function listShootingDayAssignments(
  params: ListShootingDayAssignmentsParams,
): Promise<ShootingDayAssignmentWithDetails[]> {
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

  const [assignments, crew] = await Promise.all([
    params.schedulingRepository.listAssignmentsByShootingDay(params.shootingDayId),
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

  return assignments.map((assignment) => {
    const crewMember = assignment.type === "crew" ? crewById.get(assignment.referenceId) ?? null : null;
    const equipmentItem =
      assignment.type === "equipment" ? equipmentById.get(assignment.referenceId) ?? null : null;

    return {
      assignment,
      resourceName:
        assignment.label ?? crewMember?.name ?? equipmentItem?.name ?? (assignment.type === "equipment" ? "Equipment" : null),
      crewProjectRole: crewMember?.projectRole ?? null,
      crewAccessRole: crewMember?.accessRole ?? null,
      equipmentCategory: equipmentItem?.category ?? null,
      equipmentStatus: equipmentItem?.status ?? null,
    };
  });
}
