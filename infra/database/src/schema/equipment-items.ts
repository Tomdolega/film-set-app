import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organizations } from "./organizations.js";

export const equipmentCategoryEnum = pgEnum("equipment_category", [
  "camera",
  "lens",
  "audio",
  "light",
  "grip",
  "accessory",
  "other",
]);

export const equipmentStatusEnum = pgEnum("equipment_status", [
  "available",
  "reserved",
  "checked_out",
  "maintenance",
  "unavailable",
]);

export const equipmentItems = pgTable("equipment_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: equipmentCategoryEnum("category").notNull().default("other"),
  status: equipmentStatusEnum("status").notNull().default("available"),
  description: text("description"),
  serialNumber: text("serial_number"),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type EquipmentItemRow = typeof equipmentItems.$inferSelect;
export type NewEquipmentItemRow = typeof equipmentItems.$inferInsert;
