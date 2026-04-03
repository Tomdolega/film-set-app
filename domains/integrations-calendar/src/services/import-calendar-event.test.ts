import assert from "node:assert/strict";
import test from "node:test";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewMember, CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { Notification, NotificationsRepository } from "@film-set-app/domain-notifications";
import type { Project, ProjectMember, ProjectsRepository } from "@film-set-app/domain-projects";
import type {
  CreateShootingDayRecord,
  SchedulingRepository,
  ShootingDay,
  ShootingDayAssignment,
  UpdateShootingDayRecord,
} from "@film-set-app/domain-scheduling";

import { importCalendarEvent } from "./import-calendar-event.js";

const sessionUser: SessionUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("imports a calendar event into a real shooting day with title mapping and conflict detection", async () => {
  const existingDay = createShootingDay("day-existing", {
    title: "Existing Main Unit",
    date: "2026-07-10",
    location: "Stage A",
    startTime: "08:00",
    endTime: "12:00",
  });
  const schedulingRepository = createSchedulingRepository([existingDay]);

  const result = await importCalendarEvent({
    input: {
      projectId: "project-1",
      organizationId: "org-1",
      event: {
        id: "google-event-1",
        title: "Imported Scout",
        description: "Scout walk-through",
        startDateTime: "2026-07-10T09:30:00Z",
        endDateTime: "2026-07-10T10:30:00Z",
        location: "Scout Van",
        attendees: ["pm@example.com"],
        source: "google",
      },
    },
    sessionUser,
    crewRepository: createCrewRepository([
      createCrewMember("crew-1", { userId: sessionUser.id }),
    ]),
    equipmentRepository: createEquipmentRepository(),
    notificationsRepository: createNotificationsRepository(),
    projectsRepository: createProjectsRepository(),
    schedulingRepository,
  });

  assert.equal(result.shootingDay.shootingDay.title, "Imported Scout");
  assert.equal(result.shootingDay.shootingDay.location, "Scout Van");
  assert.equal(result.shootingDay.shootingDay.startTime, "09:30");
  assert.equal(result.shootingDay.shootingDay.endTime, "10:30");
  assert.match(result.shootingDay.shootingDay.notes ?? "", /Imported from calendar\./);
  assert.doesNotMatch(result.shootingDay.shootingDay.notes ?? "", /Calendar title:/);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0]?.type, "time_overlap");
  assert.equal(schedulingRepository.days.length, 2);
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

function createSchedulingRepository(initialDays: ShootingDay[]) {
  const days = [...initialDays];

  const repository: SchedulingRepository & { days: ShootingDay[] } = {
    days,
    createShootingDay: async (input: CreateShootingDayRecord) => {
      const shootingDay = createShootingDay(`day-${days.length + 1}`, {
        projectId: input.projectId,
        organizationId: input.organizationId,
        title: input.title,
        date: input.date,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        status: input.status,
      });
      days.push(shootingDay);
      return shootingDay;
    },
    findShootingDayById: async (shootingDayId) =>
      days.find((shootingDay) => shootingDay.id === shootingDayId) ?? null,
    listShootingDaysByProject: async () => days,
    updateShootingDay: async (shootingDayId, input: UpdateShootingDayRecord) => {
      const shootingDay = days.find((candidate) => candidate.id === shootingDayId);

      if (!shootingDay) {
        return null;
      }

      Object.assign(shootingDay, input, { updatedAt: new Date("2026-02-01T00:00:00.000Z") });
      return shootingDay;
    },
    deleteShootingDay: async () => {
      throw new Error("unused");
    },
    createShootingDayAssignment: async () => {
      throw new Error("unused");
    },
    findAssignmentById: async () => {
      throw new Error("unused");
    },
    findAssignmentByReference: async () => {
      throw new Error("unused");
    },
    listAssignmentsByShootingDay: async () => [],
    listAssignmentsByProject: async () => [],
    deleteAssignment: async () => {
      throw new Error("unused");
    },
  };

  return repository;
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

function createEquipmentRepository(): EquipmentLookupRepository {
  return {
    findEquipmentItemById: async () => null,
  };
}

function createNotificationsRepository(): NotificationsRepository {
  const notifications: Notification[] = [];

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

function createShootingDay(
  id: string,
  overrides: Partial<ShootingDay> = {},
): ShootingDay {
  return {
    id,
    projectId: "project-1",
    organizationId: "org-1",
    title: "Day",
    date: "2026-07-10",
    location: "Stage",
    startTime: "08:00",
    endTime: "12:00",
    notes: null,
    status: "draft",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
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
