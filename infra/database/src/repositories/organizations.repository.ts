import { and, eq } from "drizzle-orm";

import type {
  Organization,
  OrganizationMember,
  OrganizationMemberRole,
  OrganizationsRepository,
} from "@film-set-app/domain-organizations";

import type { Database } from "../client/db.js";
import { organizationMembers } from "../schema/organization-members.js";
import { organizations } from "../schema/organizations.js";

export class DrizzleOrganizationsRepository implements OrganizationsRepository {
  constructor(private readonly database: Database) {}

  async createOrganization(input: { name: string }): Promise<Organization> {
    const [organization] = await this.database
      .insert(organizations)
      .values({ name: input.name })
      .returning();

    return organization;
  }

  async addOrganizationMember(input: {
    organizationId: string;
    userId: string;
    role: OrganizationMemberRole;
  }): Promise<OrganizationMember> {
    const [member] = await this.database
      .insert(organizationMembers)
      .values({
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
      })
      .onConflictDoUpdate({
        target: [organizationMembers.organizationId, organizationMembers.userId],
        set: {
          role: input.role,
        },
      })
      .returning();

    return member;
  }

  async findOrganizationById(organizationId: string): Promise<Organization | null> {
    return (
      (await this.database.query.organizations.findFirst({
        where: eq(organizations.id, organizationId),
      })) ?? null
    );
  }

  async findOrganizationMember(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | null> {
    return (
      (await this.database.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      })) ?? null
    );
  }
}
