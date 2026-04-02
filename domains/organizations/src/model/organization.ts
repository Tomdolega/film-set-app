export type OrganizationMemberRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  createdAt: Date;
}

export interface OrganizationWithMembership {
  organization: Organization;
  membership: OrganizationMember;
}

export interface CreateOrganizationInput {
  name: string;
}
