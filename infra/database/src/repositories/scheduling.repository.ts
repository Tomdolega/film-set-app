import { and, asc, eq } from "drizzle-orm";

import type {
  CreateShootingDayAssignmentRecord,
  CreateShootingDayRecord,
  SchedulingRepository,
  UpdateShootingDayRecord,
} from "@film-set-app/domain-scheduling";

import type { Database } from "../client/db.js";
import { shootingDayAssignments, shootingDays } from "../schema/shooting-days.js";

export class DrizzleSchedulingRepository implements SchedulingRepository {
  constructor(private readonly database: Database) {}

  async createShootingDay(input: CreateShootingDayRecord) {
    const [shootingDay] = await this.database
      .insert(shootingDays)
      .values({
        projectId: input.projectId,
        organizationId: input.organizationId,
        date: input.date,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        status: input.status,
      })
      .returning();

    return mapShootingDay(shootingDay);
  }

  async findShootingDayById(shootingDayId: string) {
    const shootingDay =
      (await this.database.query.shootingDays.findFirst({
        where: eq(shootingDays.id, shootingDayId),
      })) ?? null;

    return shootingDay ? mapShootingDay(shootingDay) : null;
  }

  async listShootingDaysByProject(projectId: string) {
    const rows = await this.database
      .select()
      .from(shootingDays)
      .where(eq(shootingDays.projectId, projectId))
      .orderBy(asc(shootingDays.date), asc(shootingDays.startTime), asc(shootingDays.createdAt));

    return rows.map(mapShootingDay);
  }

  async updateShootingDay(shootingDayId: string, input: UpdateShootingDayRecord) {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.date !== undefined) {
      values.date = input.date;
    }

    if (input.location !== undefined) {
      values.location = input.location;
    }

    if (input.startTime !== undefined) {
      values.startTime = input.startTime;
    }

    if (input.endTime !== undefined) {
      values.endTime = input.endTime;
    }

    if (input.notes !== undefined) {
      values.notes = input.notes;
    }

    if (input.status !== undefined) {
      values.status = input.status;
    }

    const [shootingDay] = await this.database
      .update(shootingDays)
      .set(values)
      .where(eq(shootingDays.id, shootingDayId))
      .returning();

    return shootingDay ? mapShootingDay(shootingDay) : null;
  }

  async deleteShootingDay(shootingDayId: string): Promise<void> {
    await this.database.delete(shootingDays).where(eq(shootingDays.id, shootingDayId));
  }

  async createShootingDayAssignment(input: CreateShootingDayAssignmentRecord) {
    const [assignment] = await this.database
      .insert(shootingDayAssignments)
      .values({
        shootingDayId: input.shootingDayId,
        projectId: input.projectId,
        organizationId: input.organizationId,
        type: input.type,
        referenceId: input.referenceId,
        label: input.label,
        callTime: input.callTime,
      })
      .returning();

    return mapAssignment(assignment);
  }

  async findAssignmentById(assignmentId: string) {
    const assignment =
      (await this.database.query.shootingDayAssignments.findFirst({
        where: eq(shootingDayAssignments.id, assignmentId),
      })) ?? null;

    return assignment ? mapAssignment(assignment) : null;
  }

  async findAssignmentByReference(input: {
    shootingDayId: string;
    type: "crew" | "equipment";
    referenceId: string;
  }) {
    const assignment =
      (await this.database.query.shootingDayAssignments.findFirst({
        where: and(
          eq(shootingDayAssignments.shootingDayId, input.shootingDayId),
          eq(shootingDayAssignments.type, input.type),
          eq(shootingDayAssignments.referenceId, input.referenceId),
        ),
      })) ?? null;

    return assignment ? mapAssignment(assignment) : null;
  }

  async listAssignmentsByShootingDay(shootingDayId: string) {
    const rows = await this.database
      .select()
      .from(shootingDayAssignments)
      .where(eq(shootingDayAssignments.shootingDayId, shootingDayId))
      .orderBy(asc(shootingDayAssignments.createdAt));

    return rows.map(mapAssignment);
  }

  async listAssignmentsByProject(projectId: string) {
    const rows = await this.database
      .select()
      .from(shootingDayAssignments)
      .where(eq(shootingDayAssignments.projectId, projectId))
      .orderBy(asc(shootingDayAssignments.createdAt));

    return rows.map(mapAssignment);
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    await this.database.delete(shootingDayAssignments).where(eq(shootingDayAssignments.id, assignmentId));
  }
}

function mapShootingDay(row: typeof shootingDays.$inferSelect) {
  return {
    ...row,
    startTime: normalizeTimeValue(row.startTime) ?? row.startTime,
    endTime: normalizeTimeValue(row.endTime) ?? row.endTime,
  };
}

function mapAssignment(row: typeof shootingDayAssignments.$inferSelect) {
  return {
    ...row,
    callTime: normalizeTimeValue(row.callTime),
  };
}

function normalizeTimeValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.slice(0, 5);
}
