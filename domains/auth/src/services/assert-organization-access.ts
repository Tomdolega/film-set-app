export type AccessRole = "owner" | "admin" | "member";

export interface OrganizationAccessMembership {
  organizationId: string;
  userId: string;
  role: AccessRole;
  createdAt: Date;
}

export interface OrganizationAccessRepository {
  findOrganizationById: (organizationId: string) => Promise<{ id: string } | null>;
  findOrganizationMember: (
    organizationId: string,
    userId: string,
  ) => Promise<OrganizationAccessMembership | null>;
}

interface StatusError extends Error {
  statusCode?: number;
}

export interface AssertOrganizationAccessParams {
  organizationId: string;
  userId: string;
  repository: OrganizationAccessRepository;
  requiredRoles?: AccessRole[];
}

export async function assertOrganizationAccess(
  params: AssertOrganizationAccessParams,
): Promise<OrganizationAccessMembership> {
  const organization = await params.repository.findOrganizationById(params.organizationId);

  if (!organization) {
    const error: StatusError = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await params.repository.findOrganizationMember(
    params.organizationId,
    params.userId,
  );

  if (!membership) {
    const error: StatusError = new Error("Organization access denied");
    error.statusCode = 403;
    throw error;
  }

  if (params.requiredRoles && !params.requiredRoles.includes(membership.role)) {
    const error: StatusError = new Error("Organization permission denied");
    error.statusCode = 403;
    throw error;
  }

  return membership;
}
