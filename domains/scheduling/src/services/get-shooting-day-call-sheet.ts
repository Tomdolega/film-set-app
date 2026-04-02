import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { CallSheet } from "../model/shooting-day.js";
import { canReadSchedule } from "../permissions/scheduling.permissions.js";
import type { SchedulingRepository } from "../repositories/scheduling.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetShootingDayCallSheetParams {
  shootingDayId: string;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  projectsRepository: ProjectsRepository;
  schedulingRepository: SchedulingRepository;
}

export async function getShootingDayCallSheet(
  params: GetShootingDayCallSheetParams,
): Promise<CallSheet> {
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
  const callTime = shootingDay.startTime;
  const callSheetCrew = assignments
    .filter((assignment) => assignment.type === "crew")
    .map((assignment) => {
      const crewMember = crewById.get(assignment.referenceId);

      if (!crewMember) {
        return null;
      }

      return {
        assignmentId: assignment.id,
        crewMemberId: crewMember.id,
        name: crewMember.name,
        accessRole: crewMember.accessRole,
        projectRole: crewMember.projectRole,
        callTime: assignment.callTime ?? callTime,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => {
      if (left.callTime !== right.callTime) {
        return left.callTime.localeCompare(right.callTime);
      }

      return left.name.localeCompare(right.name);
    });

  return {
    shootingDayId: shootingDay.id,
    projectId: shootingDay.projectId,
    organizationId: shootingDay.organizationId,
    date: shootingDay.date,
    location: shootingDay.location,
    startTime: shootingDay.startTime,
    endTime: shootingDay.endTime,
    callTime,
    notes: shootingDay.notes,
    crew: callSheetCrew,
  };
}
