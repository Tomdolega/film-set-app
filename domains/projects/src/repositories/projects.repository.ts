import type { Project, ProjectMember, ProjectMemberRole, ProjectWithMembership } from "../model/project.js";
import type { ProjectStatus } from "../model/project-status.js";

export interface CreateProjectRecord {
  organizationId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdByUserId: string;
}

export interface UpdateProjectRecord {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectsRepository {
  createProject: (input: CreateProjectRecord) => Promise<Project>;
  addProjectMember: (input: {
    projectId: string;
    userId: string;
    role: ProjectMemberRole;
  }) => Promise<ProjectMember>;
  findProjectById: (projectId: string) => Promise<Project | null>;
  findProjectMember: (projectId: string, userId: string) => Promise<ProjectMember | null>;
  listProjectsForUser: (input: { organizationId: string; userId: string }) => Promise<ProjectWithMembership[]>;
  updateProject: (projectId: string, input: UpdateProjectRecord) => Promise<Project | null>;
}
