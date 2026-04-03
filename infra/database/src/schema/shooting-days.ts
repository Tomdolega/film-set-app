import {
  date,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations.js";
import { projects } from "./projects.js";

export const shootingDayStatusEnum = pgEnum("shooting_day_status", ["draft", "locked"]);
export const shootingDayAssignmentTypeEnum = pgEnum("shooting_day_assignment_type", [
  "crew",
  "equipment",
]);

export const shootingDays = pgTable("shooting_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: date("date").notNull(),
  location: text("location").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  notes: text("notes"),
  status: shootingDayStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shootingDayAssignments = pgTable(
  "shooting_day_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shootingDayId: uuid("shooting_day_id")
      .notNull()
      .references(() => shootingDays.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: shootingDayAssignmentTypeEnum("type").notNull(),
    referenceId: uuid("reference_id").notNull(),
    label: text("label"),
    callTime: time("call_time"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dayReferenceUnique: unique("shooting_day_assignments_day_reference_unique").on(
      table.shootingDayId,
      table.type,
      table.referenceId,
    ),
  }),
);

export type ShootingDayRow = typeof shootingDays.$inferSelect;
export type NewShootingDayRow = typeof shootingDays.$inferInsert;
export type ShootingDayAssignmentRow = typeof shootingDayAssignments.$inferSelect;
export type NewShootingDayAssignmentRow = typeof shootingDayAssignments.$inferInsert;
