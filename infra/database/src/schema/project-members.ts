import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { contacts } from "./contacts.js";
import { memberRoleEnum } from "./organization-members.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    accessRole: memberRoleEnum("access_role").notNull().default("member"),
    projectRole: text("project_role"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    personReferenceCheck: check(
      "project_members_person_reference_check",
      sql`((case when ${table.userId} is not null then 1 else 0 end) + (case when ${table.contactId} is not null then 1 else 0 end)) = 1`,
    ),
    projectUserUnique: unique("project_members_project_user_unique").on(
      table.projectId,
      table.userId,
    ),
    projectContactUnique: unique("project_members_project_contact_unique").on(
      table.projectId,
      table.contactId,
    ),
  }),
);

export type ProjectMemberRow = typeof projectMembers.$inferSelect;
export type NewProjectMemberRow = typeof projectMembers.$inferInsert;
