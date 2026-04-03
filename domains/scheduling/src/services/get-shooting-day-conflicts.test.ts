import assert from "node:assert/strict";
import test from "node:test";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewMember, CrewRepository } from "@film-set-app/domain-crew";
import type { EquipmentItem, EquipmentLookupRepository } from "@film-set-app/domain-equipment";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import { getShootingDayConflicts } from "./get-shooting-day-conflicts.js";
import type { SchedulingRepository, ShootingDay, ShootingDayAssignment } from "../index.js";

const sessionUser: SessionUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("returns a warning when shooting day windows overlap", async () => {
  const currentDay = createShootingDay("day-1", {
    title: "Main Unit",
    date: "2026-07-01",
    location: "Studio A",
    startTime: "08:00",
    endTime: "12:00",
  });
  const overlappingDay = createShootingDay("day-2", {
    title: "Second Unit",
    date: "2026-07-01",
    location: "Backlot",
    startTime: "11:00",
    endTime: "14:00",
  });

  const conflicts = await getShootingDayConflicts({
    shootingDayId: currentDay.id,
    sessionUser,
    crewRepository: createCrewRepository([]),
    equipmentRepository: createEquipmentRepository([]),
    projectsRepository: createProjectsRepository(),
    schedulingRepository: createSchedulingRepository({
      shootingDays: [currentDay, overlappingDay],
      assignments: [],
    }),
  });

  assert.equal(conflicts.length, 1);
  assert.deepEqual(conflicts[0], {
    type: "time_overlap",
    severity: "warning",
    message: "Overlaps with shooting day on 2026-07-01 from 11:00 to 14:00.",
    relatedEntityId: "day-2",
    relatedShootingDayId: "day-2",
  });
});

test("returns crew and equipment conflicts for shared resources on overlapping days", async () => {
  const currentDay = createShootingDay("day-1", {
    title: "Main Unit",
    date: "2026-07-01",
    location: "Studio A",
    startTime: "08:00",
    endTime: "12:00",
  });
  const overlappingDay = createShootingDay("day-2", {
    title: "Second Unit",
    date: "2026-07-01",
    location: "Backlot",
    startTime: "09:00",
    endTime: "11:00",
  });
  const assignments = [
    createAssignment("assign-1", currentDay.id, "crew", "crew-1"),
    createAssignment("assign-2", currentDay.id, "equipment", "eq-1"),
    createAssignment("assign-3", overlappingDay.id, "crew", "crew-1"),
    createAssignment("assign-4", overlappingDay.id, "equipment", "eq-1"),
  ];

  const conflicts = await getShootingDayConflicts({
    shootingDayId: currentDay.id,
    sessionUser,
    crewRepository: createCrewRepository([
      createCrewMember("crew-1", {
        userId: "crew-user-1",
        name: "Alex Camera",
      }),
    ]),
    equipmentRepository: createEquipmentRepository([
      createEquipmentItem("eq-1", {
        name: "A-Cam",
      }),
    ]),
    projectsRepository: createProjectsRepository(),
    schedulingRepository: createSchedulingRepository({
      shootingDays: [currentDay, overlappingDay],
      assignments,
    }),
  });

  assert.deepEqual(
    conflicts.map((conflict) => conflict.type).sort(),
    ["crew_conflict", "equipment_conflict", "time_overlap"],
  );
  assert.equal(
    conflicts.find((conflict) => conflict.type === "crew_conflict")?.message,
    "Alex Camera is already assigned to another overlapping shooting day on 2026-07-01.",
  );
  assert.equal(
    conflicts.find((conflict) => conflict.type === "equipment_conflict")?.message,
    "A-Cam is already assigned to another overlapping shooting day on 2026-07-01.",
  );
});

function createProjectsRepository(): ProjectsRepository {
  return {
    createProject: async () => {
      throw new Error("unused");
    },
    addProjectMember: async () => {
      throw new Error("unused");
    },
    findProjectById: async () => ({ id: "project-1", organizationId: "org-1" } as never),
    findProjectMember: async () => ({
      projectId: "project-1",
      userId: sessionUser.id,
      role: "owner",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
    listProjectsForUser: async () => {
      throw new Error("unused");
    },
    updateProject: async () => {
      throw new Error("unused");
    },
  };
}

function createSchedulingRepository(input: {
  shootingDays: ShootingDay[];
  assignments: ShootingDayAssignment[];
}): SchedulingRepository {
  return {
    createShootingDay: async () => {
      throw new Error("unused");
    },
    findShootingDayById: async (shootingDayId) =>
      input.shootingDays.find((shootingDay) => shootingDay.id === shootingDayId) ?? null,
    listShootingDaysByProject: async () => input.shootingDays,
    updateShootingDay: async () => {
      throw new Error("unused");
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
    listAssignmentsByShootingDay: async (shootingDayId) =>
      input.assignments.filter((assignment) => assignment.shootingDayId === shootingDayId),
    listAssignmentsByProject: async () => input.assignments,
    deleteAssignment: async () => {
      throw new Error("unused");
    },
  };
}

function createCrewRepository(crewMembers: CrewMember[]): CrewRepository {
  return {
    createCrewMember: async () => {
      throw new Error("unused");
    },
    findCrewMemberById: async (projectMemberId) =>
      crewMembers.find((member) => member.id === projectMemberId) ?? null,
    findCrewMemberByUserId: async () => {
      throw new Error("unused");
    },
    findCrewMemberByContactId: async () => {
      throw new Error("unused");
    },
    listProjectCrew: async () => crewMembers,
    countCrewMembersByAccessRole: async () => {
      throw new Error("unused");
    },
    updateCrewMember: async () => {
      throw new Error("unused");
    },
    removeCrewMember: async () => {
      throw new Error("unused");
    },
  };
}

function createEquipmentRepository(equipmentItems: EquipmentItem[]): EquipmentLookupRepository {
  return {
    findEquipmentItemById: async (equipmentId) =>
      equipmentItems.find((equipmentItem) => equipmentItem.id === equipmentId) ?? null,
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
    date: "2026-07-01",
    location: "Studio",
    startTime: "08:00",
    endTime: "12:00",
    notes: null,
    status: "draft",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function createAssignment(
  id: string,
  shootingDayId: string,
  type: "crew" | "equipment",
  referenceId: string,
): ShootingDayAssignment {
  return {
    id,
    shootingDayId,
    projectId: "project-1",
    organizationId: "org-1",
    type,
    referenceId,
    label: null,
    callTime: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
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
    projectRole: "camera",
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

function createEquipmentItem(
  id: string,
  overrides: Partial<EquipmentItem> = {},
): EquipmentItem {
  return {
    id,
    organizationId: "org-1",
    name: "Equipment",
    category: "camera",
    status: "available",
    description: null,
    serialNumber: null,
    notes: null,
    archivedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
