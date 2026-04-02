import type { OrganizationMemberRole } from "../model/organization.js";

export function canReadOrganization(_role: OrganizationMemberRole): boolean {
  return true;
}

export function canManageOrganization(role: OrganizationMemberRole): boolean {
  return role === "owner" || role === "admin";
}
