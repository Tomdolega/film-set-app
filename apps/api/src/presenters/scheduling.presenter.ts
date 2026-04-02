import type {
  CallSheet,
  ScheduleConflict,
  ShootingDayAssignment,
  ShootingDayAssignmentWithDetails,
  ShootingDayWithMembership,
} from "@film-set-app/domain-scheduling";

export function presentShootingDay(result: ShootingDayWithMembership) {
  return {
    id: result.shootingDay.id,
    projectId: result.shootingDay.projectId,
    organizationId: result.shootingDay.organizationId,
    date: result.shootingDay.date,
    location: result.shootingDay.location,
    startTime: result.shootingDay.startTime,
    endTime: result.shootingDay.endTime,
    notes: result.shootingDay.notes,
    status: result.shootingDay.status,
    createdAt: result.shootingDay.createdAt.toISOString(),
    updatedAt: result.shootingDay.updatedAt.toISOString(),
    currentUserRole: result.currentUserRole,
  };
}

export function presentShootingDayAssignment(assignment: ShootingDayAssignment) {
  return {
    id: assignment.id,
    shootingDayId: assignment.shootingDayId,
    projectId: assignment.projectId,
    organizationId: assignment.organizationId,
    type: assignment.type,
    referenceId: assignment.referenceId,
    label: assignment.label,
    callTime: assignment.callTime,
    createdAt: assignment.createdAt.toISOString(),
  };
}

export function presentShootingDayAssignmentDetails(
  assignment: ShootingDayAssignmentWithDetails,
) {
  return {
    ...presentShootingDayAssignment(assignment.assignment),
    resourceName: assignment.resourceName,
    crewProjectRole: assignment.crewProjectRole,
    crewAccessRole: assignment.crewAccessRole,
    equipmentCategory: assignment.equipmentCategory,
    equipmentStatus: assignment.equipmentStatus,
  };
}

export function presentScheduleConflict(conflict: ScheduleConflict) {
  return {
    type: conflict.type,
    severity: conflict.severity,
    message: conflict.message,
    relatedEntityId: conflict.relatedEntityId,
    relatedShootingDayId: conflict.relatedShootingDayId,
  };
}

export function presentCallSheet(callSheet: CallSheet) {
  return {
    shootingDayId: callSheet.shootingDayId,
    projectId: callSheet.projectId,
    organizationId: callSheet.organizationId,
    date: callSheet.date,
    location: callSheet.location,
    startTime: callSheet.startTime,
    endTime: callSheet.endTime,
    callTime: callSheet.callTime,
    notes: callSheet.notes,
    crew: callSheet.crew,
  };
}
