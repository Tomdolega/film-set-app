import assert from "node:assert/strict";
import test from "node:test";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewMember, CrewRepository } from "@film-set-app/domain-crew";
import type { Notification, NotificationsRepository } from "@film-set-app/domain-notifications";
import type { Project, ProjectMember, ProjectsRepository } from "@film-set-app/domain-projects";
import type {
  CreateShootingDayRecord,
  SchedulingRepository,
  ShootingDay,
  ShootingDayAssignment,
  UpdateShootingDayRecord,
} from "@film-set-app/domain-scheduling";

import { createShootingDay } from "./create-shooting-day.js";

const sessionUser: SessionUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("creates notifications for other project users while avoiding self-notifications", async () => {
  const notifications: Notification[] = [];

  await createShootingDay({
    projectId: "project-1",
    input: {
      title: "Day 3 | Night Exterior",
      date: "2026-07-20",
      location: "Backlot",
      startTime: "18:00",
      endTime: "22:00",
      notes: "Night setup",
      status: "draft",
    },
    sessionUser,
    crewRepository: createCrewRepository([
      createCrewMember("crew-owner", {
        userId: sessionUser.id,
        name: "Owner",
      }),
      createCrewMember("crew-other", {
        userId: "user-2",
        name: "Producer Two",
      }),
    ]),
    notificationsRepository: createNotificationsRepository(notifications),
    projectsRepository: createProjectsRepository(),
    schedulingRepository: createSchedulingRepository(),
  });

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0]?.userId, "user-2");
  assert.equal(notifications[0]?.title, "Shooting day created");
  assert.match(notifications[0]?.message ?? "", /Day 3 \| Night Exterior/);
});

function createProjectsRepository(): ProjectsRepository {
  const project: Project = {
    id: "project-1",
    organizationId: "org-1",
    name: "Project One",
    description: null,
    status: "draft",
    startDate: null,
    endDate: null,
    createdByUserId: sessionUser.id,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const membership: ProjectMember = {
    projectId: project.id,
    userId: sessionUser.id,
    role: "owner",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  return {
    createProject: async () => {
      throw new Error("unused");
    },
    addProjectMember: async () => {
      throw new Error("unused");
    },
    findProjectById: async () => project,
    findProjectMember: async () => membership,
    listProjectsForUser: async () => {
      throw new Error("unused");
    },
    updateProject: async () => {
      throw new Error("unused");
    },
  };
}

function createCrewRepository(crewMembers: CrewMember[]): CrewRepository {
  return {
    createCrewMember: async () => {
      throw new Error("unused");
    },
    findCrewMemberById: async () => null,
    findCrewMemberByUserId: async () => null,
    findCrewMemberByContactId: async () => null,
    listProjectCrew: async () => crewMembers,
    countCrewMembersByAccessRole: async () => 0,
    updateCrewMember: async () => null,
    removeCrewMember: async () => {
      throw new Error("unused");
    },
  };
}

function createNotificationsRepository(notifications: Notification[]): NotificationsRepository {
  return {
    createNotification: async (input) => {
      const notification: Notification = {
        id: `notification-${notifications.length + 1}`,
        userId: input.userId,
        organizationId: input.organizationId,
        projectId: input.projectId,
        type: input.type,
        severity: input.severity,
        title: input.title,
        message: input.message,
        isRead: false,
        linkPath: input.linkPath,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      notifications.push(notification);
      return notification;
    },
    findNotificationById: async (notificationId) =>
      notifications.find((notification) => notification.id === notificationId) ?? null,
    listNotificationsByUser: async (userId) =>
      notifications.filter((notification) => notification.userId === userId),
    countUnreadNotificationsByUser: async (userId) =>
      notifications.filter((notification) => notification.userId === userId && !notification.isRead).length,
    markNotificationAsRead: async (notificationId) => {
      const notification = notifications.find((entry) => entry.id === notificationId) ?? null;

      if (!notification) {
        return null;
      }

      notification.isRead = true;
      return notification;
    },
    markAllNotificationsAsRead: async (userId) => {
      let updatedCount = 0;

      for (const notification of notifications) {
        if (notification.userId === userId && !notification.isRead) {
          notification.isRead = true;
          updatedCount += 1;
        }
      }

      return updatedCount;
    },
  };
}

function createSchedulingRepository(): SchedulingRepository {
  return {
    createShootingDay: async (input: CreateShootingDayRecord) =>
      createStoredShootingDay("day-1", input),
    findShootingDayById: async () => null,
    listShootingDaysByProject: async () => [],
    updateShootingDay: async (_shootingDayId, _input: UpdateShootingDayRecord) => null,
    deleteShootingDay: async () => {
      throw new Error("unused");
    },
    createShootingDayAssignment: async () => {
      throw new Error("unused");
    },
    findAssignmentById: async () => null,
    findAssignmentByReference: async () => null,
    listAssignmentsByShootingDay: async () => [],
    listAssignmentsByProject: async () => [],
    deleteAssignment: async () => {
      throw new Error("unused");
    },
  };
}

function createStoredShootingDay(
  id: string,
  input: CreateShootingDayRecord,
): ShootingDay {
  return {
    id,
    projectId: input.projectId,
    organizationId: input.organizationId,
    title: input.title,
    date: input.date,
    location: input.location,
    startTime: input.startTime,
    endTime: input.endTime,
    notes: input.notes,
    status: input.status,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createCrewMember(
  id: string,
  overrides: Partial<CrewMember> = {},
): CrewMember {
  return {
    id,
    projectId: "project-1",
    organizationId: "org-1",
    userId: "crew-user-1",
    contactId: null,
    accessRole: "member",
    projectRole: "production",
    sourceType: "user",
    name: "Crew Member",
    email: "crew@example.com",
    phone: null,
    company: null,
    contactType: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
