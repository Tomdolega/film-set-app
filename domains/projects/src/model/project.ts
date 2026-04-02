import type { ProjectStatus } from "./project-status.js";

export type ProjectMemberRole = "owner" | "admin" | "member";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: Date;
}

export interface ProjectWithMembership {
  project: Project;
  membership: ProjectMember;
}
