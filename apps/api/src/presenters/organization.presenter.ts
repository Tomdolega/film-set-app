import type { OrganizationWithMembership } from "@film-set-app/domain-organizations";

export function presentOrganization(result: OrganizationWithMembership) {
  return {
    id: result.organization.id,
    name: result.organization.name,
    createdAt: result.organization.createdAt.toISOString(),
    updatedAt: result.organization.updatedAt.toISOString(),
    currentUserRole: result.membership.role,
  };
}
