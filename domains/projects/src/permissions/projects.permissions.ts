import type { ProjectMemberRole } from "../model/project.js";

export function canReadProject(_role: ProjectMemberRole): boolean {
  return true;
}

export function canManageProject(role: ProjectMemberRole): boolean {
  return role === "owner" || role === "admin";
}
