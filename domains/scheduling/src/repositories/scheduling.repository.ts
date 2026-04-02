import type {
  ShootingDay,
  ShootingDayAssignment,
  ShootingDayAssignmentType,
  ShootingDayStatus,
} from "../model/shooting-day.js";

export interface CreateShootingDayRecord {
  projectId: string;
  organizationId: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: ShootingDayStatus;
}

export interface UpdateShootingDayRecord {
  date?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
  status?: ShootingDayStatus;
}

export interface CreateShootingDayAssignmentRecord {
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  type: ShootingDayAssignmentType;
  referenceId: string;
  label: string | null;
  callTime: string | null;
}

export interface SchedulingRepository {
  createShootingDay: (input: CreateShootingDayRecord) => Promise<ShootingDay>;
  findShootingDayById: (shootingDayId: string) => Promise<ShootingDay | null>;
  listShootingDaysByProject: (projectId: string) => Promise<ShootingDay[]>;
  updateShootingDay: (
    shootingDayId: string,
    input: UpdateShootingDayRecord,
  ) => Promise<ShootingDay | null>;
  deleteShootingDay: (shootingDayId: string) => Promise<void>;
  createShootingDayAssignment: (
    input: CreateShootingDayAssignmentRecord,
  ) => Promise<ShootingDayAssignment>;
  findAssignmentById: (assignmentId: string) => Promise<ShootingDayAssignment | null>;
  findAssignmentByReference: (input: {
    shootingDayId: string;
    type: ShootingDayAssignmentType;
    referenceId: string;
  }) => Promise<ShootingDayAssignment | null>;
  listAssignmentsByShootingDay: (shootingDayId: string) => Promise<ShootingDayAssignment[]>;
  listAssignmentsByProject: (projectId: string) => Promise<ShootingDayAssignment[]>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
}
