export type CrewPermissionRole = "owner" | "admin" | "member";

export function canReadCrew(_role: CrewPermissionRole): boolean {
  return true;
}

export function canManageCrew(role: CrewPermissionRole): boolean {
  return role === "owner" || role === "admin";
}
