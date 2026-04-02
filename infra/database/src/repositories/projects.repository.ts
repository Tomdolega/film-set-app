import { and, asc, eq } from "drizzle-orm";

import type {
  CreateProjectRecord,
  Project,
  ProjectMember,
  ProjectMemberRole,
  ProjectsRepository,
  ProjectWithMembership,
  UpdateProjectRecord,
} from "@film-set-app/domain-projects";

import type { Database } from "../client/db.js";
import { projectMembers } from "../schema/project-members.js";
import { projects } from "../schema/projects.js";

export class DrizzleProjectsRepository implements ProjectsRepository {
  constructor(private readonly database: Database) {}

  async createProject(input: CreateProjectRecord): Promise<Project> {
    const [project] = await this.database
      .insert(projects)
      .values({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        createdByUserId: input.createdByUserId,
      })
      .returning();

    return project;
  }

  async addProjectMember(input: {
    projectId: string;
    userId: string;
    role: ProjectMemberRole;
  }): Promise<ProjectMember> {
    const [member] = await this.database
      .insert(projectMembers)
      .values({
        projectId: input.projectId,
        userId: input.userId,
        accessRole: input.role,
        projectRole: null,
      })
      .onConflictDoUpdate({
        target: [projectMembers.projectId, projectMembers.userId],
        set: {
          accessRole: input.role,
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapProjectMember(member);
  }

  async findProjectById(projectId: string): Promise<Project | null> {
    return (
      (await this.database.query.projects.findFirst({
        where: eq(projects.id, projectId),
      })) ?? null
    );
  }

  async findProjectMember(projectId: string, userId: string): Promise<ProjectMember | null> {
    const member =
      (await this.database.query.projectMembers.findFirst({
        where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
      })) ?? null;

    return member ? mapProjectMember(member) : null;
  }

  async listProjectsForUser(input: {
    organizationId: string;
    userId: string;
  }): Promise<ProjectWithMembership[]> {
    const rows = await this.database
      .select({
        project: projects,
        membership: projectMembers,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(
        and(
          eq(projectMembers.userId, input.userId),
          eq(projects.organizationId, input.organizationId),
        ),
      )
      .orderBy(asc(projects.createdAt));

    return rows.map((row) => ({
      project: row.project,
      membership: mapProjectMember(row.membership),
    }));
  }

  async updateProject(projectId: string, input: UpdateProjectRecord): Promise<Project | null> {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name;
    }

    if (input.description !== undefined) {
      values.description = input.description;
    }

    if (input.status !== undefined) {
      values.status = input.status;
    }

    if (input.startDate !== undefined) {
      values.startDate = input.startDate;
    }

    if (input.endDate !== undefined) {
      values.endDate = input.endDate;
    }

    const [project] = await this.database
      .update(projects)
      .set(values)
      .where(eq(projects.id, projectId))
      .returning();

    return project ?? null;
  }
}

function mapProjectMember(member: typeof projectMembers.$inferSelect): ProjectMember {
  if (!member.userId) {
    throw new Error("Project membership for a user is missing userId");
  }

  return {
    projectId: member.projectId,
    userId: member.userId,
    role: member.accessRole,
    createdAt: member.createdAt,
  };
}
