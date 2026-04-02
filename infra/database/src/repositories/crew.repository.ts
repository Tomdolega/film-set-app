import { and, asc, eq, sql } from "drizzle-orm";

import type {
  CreateCrewMemberRecord,
  CrewAccessRole,
  CrewMember,
  CrewRepository,
  UpdateCrewMemberRecord,
} from "@film-set-app/domain-crew";

import type { Database } from "../client/db.js";
import { contacts } from "../schema/contacts.js";
import { projectMembers } from "../schema/project-members.js";
import { projects } from "../schema/projects.js";
import { users } from "../schema/users.js";

export class DrizzleCrewRepository implements CrewRepository {
  constructor(private readonly database: Database) {}

  async createCrewMember(input: CreateCrewMemberRecord): Promise<CrewMember> {
    const [membership] = await this.database
      .insert(projectMembers)
      .values({
        projectId: input.projectId,
        userId: input.userId,
        contactId: input.contactId,
        accessRole: input.accessRole,
        projectRole: input.projectRole,
      })
      .returning();

    return this.requireCrewMember(membership.id);
  }

  async findCrewMemberById(projectMemberId: string): Promise<CrewMember | null> {
    const row = await this.database
      .select({
        membership: projectMembers,
        project: projects,
        user: users,
        contact: contacts,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .leftJoin(contacts, eq(projectMembers.contactId, contacts.id))
      .where(eq(projectMembers.id, projectMemberId))
      .limit(1);

    return row[0] ? mapCrewMember(row[0]) : null;
  }

  async findCrewMemberByUserId(projectId: string, userId: string): Promise<CrewMember | null> {
    const row = await this.database
      .select({
        membership: projectMembers,
        project: projects,
        user: users,
        contact: contacts,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .leftJoin(contacts, eq(projectMembers.contactId, contacts.id))
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
      .limit(1);

    return row[0] ? mapCrewMember(row[0]) : null;
  }

  async findCrewMemberByContactId(projectId: string, contactId: string): Promise<CrewMember | null> {
    const row = await this.database
      .select({
        membership: projectMembers,
        project: projects,
        user: users,
        contact: contacts,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .leftJoin(contacts, eq(projectMembers.contactId, contacts.id))
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.contactId, contactId)))
      .limit(1);

    return row[0] ? mapCrewMember(row[0]) : null;
  }

  async listProjectCrew(projectId: string): Promise<CrewMember[]> {
    const rows = await this.database
      .select({
        membership: projectMembers,
        project: projects,
        user: users,
        contact: contacts,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .leftJoin(contacts, eq(projectMembers.contactId, contacts.id))
      .where(eq(projectMembers.projectId, projectId))
      .orderBy(asc(projectMembers.createdAt));

    return rows.map(mapCrewMember);
  }

  async countCrewMembersByAccessRole(projectId: string, accessRole: CrewAccessRole): Promise<number> {
    const rows = await this.database
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.accessRole, accessRole)));

    return rows[0]?.count ?? 0;
  }

  async updateCrewMember(
    projectMemberId: string,
    input: UpdateCrewMemberRecord,
  ): Promise<CrewMember | null> {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.accessRole !== undefined) {
      values.accessRole = input.accessRole;
    }

    if (input.projectRole !== undefined) {
      values.projectRole = input.projectRole;
    }

    const [membership] = await this.database
      .update(projectMembers)
      .set(values)
      .where(eq(projectMembers.id, projectMemberId))
      .returning();

    if (!membership) {
      return null;
    }

    return this.requireCrewMember(membership.id);
  }

  async removeCrewMember(projectMemberId: string): Promise<void> {
    await this.database.delete(projectMembers).where(eq(projectMembers.id, projectMemberId));
  }

  private async requireCrewMember(projectMemberId: string): Promise<CrewMember> {
    const member = await this.findCrewMemberById(projectMemberId);

    if (!member) {
      throw new Error("Crew member not found after write");
    }

    return member;
  }
}

function mapCrewMember(row: {
  membership: typeof projectMembers.$inferSelect;
  project: typeof projects.$inferSelect;
  user: typeof users.$inferSelect | null;
  contact: typeof contacts.$inferSelect | null;
}): CrewMember {
  const sourceType = row.membership.userId ? "user" : "contact";
  const name =
    sourceType === "user"
      ? row.user?.name ?? row.user?.email ?? "Unnamed user"
      : row.contact?.name ?? "Unnamed contact";

  return {
    id: row.membership.id,
    projectId: row.membership.projectId,
    organizationId: row.project.organizationId,
    userId: row.membership.userId,
    contactId: row.membership.contactId,
    accessRole: row.membership.accessRole,
    projectRole: row.membership.projectRole,
    sourceType,
    name,
    email: sourceType === "user" ? row.user?.email ?? null : row.contact?.email ?? null,
    phone: row.contact?.phone ?? null,
    company: row.contact?.company ?? null,
    contactType: row.contact?.type ?? null,
    createdAt: row.membership.createdAt,
    updatedAt: row.membership.updatedAt,
  };
}
