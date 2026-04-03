import assert from "node:assert/strict";
import test from "node:test";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { Project, ProjectMember, ProjectsRepository, ProjectWithMembership } from "@film-set-app/domain-projects";

import { parseCreateProjectInput } from "../schemas/project-schemas.js";
import { updateProject } from "./update-project.js";

test("rejects project creation when the start date is after the end date", () => {
  assert.throws(
    () =>
      parseCreateProjectInput({
        organizationId: "org-1",
        name: "Alpha Project",
        startDate: "2026-05-10",
        endDate: "2026-05-04",
      }),
    {
      message: "Project start date must be on or before the end date",
    },
  );
});

test("rejects project updates when partial date changes would invert the stored date range", async () => {
  const repository = new InMemoryProjectsRepository({
    id: "project-1",
    organizationId: "org-1",
    name: "Alpha Project",
    description: null,
    status: "active",
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    createdByUserId: "user-1",
    createdAt: new Date("2026-04-03T00:00:00.000Z"),
    updatedAt: new Date("2026-04-03T00:00:00.000Z"),
  });

  await assert.rejects(
    () =>
      updateProject({
        projectId: "project-1",
        input: {
          startDate: "2026-05-12",
        },
        sessionUser: createSessionUser(),
        projectsRepository: repository,
      }),
    (error: Error & { statusCode?: number }) => {
      assert.equal(error.message, "Project start date must be on or before the end date");
      assert.equal(error.statusCode, 400);
      return true;
    },
  );

  assert.equal(repository.updateCalls, 0);
});

function createSessionUser(): SessionUser {
  return {
    id: "user-1",
    email: "owner@example.com",
    name: "Owner",
  };
}

class InMemoryProjectsRepository implements ProjectsRepository {
  updateCalls = 0;

  constructor(private readonly project: Project) {}

  async createProject(): Promise<Project> {
    throw new Error("unused");
  }

  async addProjectMember(): Promise<ProjectMember> {
    throw new Error("unused");
  }

  async findProjectById(projectId: string): Promise<Project | null> {
    return projectId === this.project.id ? this.project : null;
  }

  async findProjectMember(projectId: string, userId: string): Promise<ProjectMember | null> {
    if (projectId !== this.project.id || userId !== "user-1") {
      return null;
    }

    return {
      projectId,
      userId,
      role: "owner",
      createdAt: new Date("2026-04-03T00:00:00.000Z"),
    };
  }

  async listProjectsForUser(): Promise<ProjectWithMembership[]> {
    throw new Error("unused");
  }

  async updateProject(): Promise<Project | null> {
    this.updateCalls += 1;
    return this.project;
  }
}
