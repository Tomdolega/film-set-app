import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const notificationTypeEnum = pgEnum("notification_type", [
  "project_update",
  "crew_assignment",
  "shooting_day_update",
  "schedule_conflict",
  "document_uploaded",
  "equipment_update",
  "generic",
]);

export const notificationSeverityEnum = pgEnum("notification_severity", [
  "info",
  "warning",
  "conflict",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    type: notificationTypeEnum("type").notNull().default("generic"),
    severity: notificationSeverityEnum("severity").notNull().default("info"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    linkPath: text("link_path"),
    relatedEntityType: text("related_entity_type"),
    relatedEntityId: uuid("related_entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userCreatedAtIndex: index("notifications_user_created_at_idx").on(table.userId, table.createdAt),
    userIsReadIndex: index("notifications_user_is_read_idx").on(table.userId, table.isRead),
  }),
);

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
