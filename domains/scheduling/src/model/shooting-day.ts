export type ShootingDayStatus = "draft" | "locked";
export type ShootingDayAssignmentType = "crew" | "equipment";
export type ScheduleConflictType = "crew_conflict" | "equipment_conflict" | "time_overlap";
export type ScheduleConflictSeverity = "warning" | "conflict";
export type ShootingDayAccessRole = "owner" | "admin" | "member";

export interface ShootingDay {
  id: string;
  projectId: string;
  organizationId: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: ShootingDayStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShootingDayAssignment {
  id: string;
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  type: ShootingDayAssignmentType;
  referenceId: string;
  label: string | null;
  callTime: string | null;
  createdAt: Date;
}

export interface ShootingDayAssignmentWithDetails {
  assignment: ShootingDayAssignment;
  resourceName: string | null;
  crewProjectRole: string | null;
  crewAccessRole: ShootingDayAccessRole | null;
  equipmentCategory:
    | "camera"
    | "lens"
    | "audio"
    | "light"
    | "grip"
    | "accessory"
    | "other"
    | null;
  equipmentStatus:
    | "available"
    | "reserved"
    | "checked_out"
    | "maintenance"
    | "unavailable"
    | null;
}

export interface ScheduleConflict {
  type: ScheduleConflictType;
  severity: ScheduleConflictSeverity;
  message: string;
  relatedEntityId: string;
  relatedShootingDayId: string;
}

export interface CallSheetCrewEntry {
  assignmentId: string;
  crewMemberId: string;
  name: string;
  accessRole: ShootingDayAccessRole;
  projectRole: string | null;
  callTime: string;
}

export interface CallSheet {
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  callTime: string;
  notes: string | null;
  crew: CallSheetCrewEntry[];
}

export interface ShootingDayWithMembership {
  shootingDay: ShootingDay;
  currentUserRole: ShootingDayAccessRole;
}
