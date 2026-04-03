import type { Organization, OrganizationMember, OrganizationMemberRole } from "../model/organization.js";

export interface OrganizationsRepository {
  createOrganization: (input: { name: string }) => Promise<Organization>;
  listOrganizationsForUser: (userId: string) => Promise<
    {
      organization: Organization;
      membership: OrganizationMember;
    }[]
  >;
  addOrganizationMember: (input: {
    organizationId: string;
    userId: string;
    role: OrganizationMemberRole;
  }) => Promise<OrganizationMember>;
  findOrganizationById: (organizationId: string) => Promise<Organization | null>;
  findOrganizationMember: (
    organizationId: string,
    userId: string,
  ) => Promise<OrganizationMember | null>;
}
