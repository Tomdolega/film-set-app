import "dotenv/config";

import { and, eq } from "drizzle-orm";

import { hashPassword } from "@film-set-app/domain-auth";

import { createDatabaseClient, getDatabaseErrorMessage } from "../client/db.js";
import { DrizzleCrewRepository } from "../repositories/crew.repository.js";
import { DrizzleNotificationsRepository } from "../repositories/notifications.repository.js";
import { DrizzleOrganizationsRepository } from "../repositories/organizations.repository.js";
import { DrizzleProjectsRepository } from "../repositories/projects.repository.js";
import { DrizzleSchedulingRepository } from "../repositories/scheduling.repository.js";
import { DrizzleUsersRepository } from "../repositories/users.repository.js";
import { contacts } from "../schema/contacts.js";
import { equipmentItems } from "../schema/equipment-items.js";
import { notifications } from "../schema/notifications.js";
import { organizationMembers } from "../schema/organization-members.js";
import { organizations } from "../schema/organizations.js";
import { projects } from "../schema/projects.js";
import { shootingDays } from "../schema/shooting-days.js";

const DEFAULT_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_USER_EMAIL = "owner@example.com";
const DEFAULT_USER_NAME = "Demo Owner";
const DEFAULT_USER_PASSWORD = "dev-password";
const DEFAULT_ORGANIZATION_ID = "22222222-2222-2222-2222-222222222222";
const DEFAULT_ORGANIZATION_NAME = "Demo Organization";
const DEMO_PROJECT_ID = "33333333-3333-3333-3333-333333333333";
const DEMO_PROJECT_NAME = "Closed Alpha Demo Project";
const DEMO_UPLOAD_ASSET_PATH = "docs/demo-assets/demo-call-sheet.txt";

const DEMO_CONTACTS = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    name: "Marta Producer",
    email: "marta.producer@example.com",
    phone: "+48 600 100 101",
    company: "North Unit Productions",
    type: "person" as const,
    tags: ["producer", "approvals"],
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    name: "Kuba DoP",
    email: "kuba.dop@example.com",
    phone: "+48 600 100 102",
    company: "North Unit Productions",
    type: "person" as const,
    tags: ["camera", "crew"],
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    name: "Blue Sky Lighting",
    email: "rentals@bluesky-lighting.example.com",
    phone: "+48 600 100 103",
    company: "Blue Sky Lighting",
    type: "vendor" as const,
    tags: ["lighting", "vendor"],
  },
];

const DEMO_EQUIPMENT = [
  {
    id: "55555555-5555-5555-5555-555555555551",
    name: "Sony FX6 A-Cam",
    category: "camera" as const,
    status: "available" as const,
    serialNumber: "FX6-ALPHA-001",
    description: "Primary camera body for closed-alpha demo scheduling.",
    notes: "Use this item to verify equipment conflicts across overlapping days.",
  },
  {
    id: "55555555-5555-5555-5555-555555555552",
    name: "Zeiss CP.3 35mm",
    category: "lens" as const,
    status: "available" as const,
    serialNumber: "CP3-35-002",
    description: "Prime lens package item.",
    notes: "Available for secondary assignments.",
  },
  {
    id: "55555555-5555-5555-5555-555555555553",
    name: "Aputure 600D",
    category: "light" as const,
    status: "available" as const,
    serialNumber: "600D-003",
    description: "Key light for interior scenes.",
    notes: "Used to validate the basic equipment inventory flow.",
  },
];

const DEMO_SHOOTING_DAYS = [
  {
    id: "66666666-6666-6666-6666-666666666661",
    title: "Day 1 | Main Unit",
    date: "2026-05-04",
    location: "Studio A",
    startTime: "08:00",
    endTime: "18:00",
    notes: "Prep, blocking, and principal photography.",
    status: "draft" as const,
  },
  {
    id: "66666666-6666-6666-6666-666666666662",
    title: "Day 1 | Pickup Unit",
    date: "2026-05-04",
    location: "Backlot",
    startTime: "13:00",
    endTime: "20:00",
    notes: "Intentional overlap for smoke-testing schedule conflicts.",
    status: "draft" as const,
  },
];

const DEMO_NOTIFICATIONS = [
  {
    id: "77777777-7777-7777-7777-777777777771",
    type: "project_update" as const,
    severity: "info" as const,
    title: "Demo workspace ready",
    message: "The closed-alpha demo project is ready for validation flows.",
    relatedEntityType: "project" as const,
    relatedEntityId: DEMO_PROJECT_ID,
  },
  {
    id: "77777777-7777-7777-7777-777777777772",
    type: "schedule_conflict" as const,
    severity: "warning" as const,
    title: "Demo conflict waiting",
    message: "Open the seeded shooting day to verify that overlapping crew and equipment conflicts are displayed.",
    relatedEntityType: "shooting_day" as const,
    relatedEntityId: "66666666-6666-6666-6666-666666666661",
  },
];

async function main() {
  const databaseClient = createDatabaseClient();
  const usersRepository = new DrizzleUsersRepository(databaseClient.db);
  const organizationsRepository = new DrizzleOrganizationsRepository(databaseClient.db);
  const projectsRepository = new DrizzleProjectsRepository(databaseClient.db);
  const crewRepository = new DrizzleCrewRepository(databaseClient.db);
  const schedulingRepository = new DrizzleSchedulingRepository(databaseClient.db);
  const notificationsRepository = new DrizzleNotificationsRepository(databaseClient.db);

  const userId = process.env.DEV_SEED_USER_ID ?? DEFAULT_USER_ID;
  const userEmail = process.env.DEV_SEED_USER_EMAIL ?? DEFAULT_USER_EMAIL;
  const userName = process.env.DEV_SEED_USER_NAME ?? DEFAULT_USER_NAME;
  const userPassword = process.env.DEV_SEED_USER_PASSWORD ?? DEFAULT_USER_PASSWORD;
  const organizationId = process.env.DEV_SEED_ORGANIZATION_ID ?? DEFAULT_ORGANIZATION_ID;
  const organizationName = process.env.DEV_SEED_ORGANIZATION_NAME ?? DEFAULT_ORGANIZATION_NAME;

  try {
    const passwordHash = await hashPassword(userPassword);
    const user = await usersRepository.upsertUser({
      id: userId,
      email: userEmail,
      name: userName,
      passwordHash,
    });

    const organization = await upsertOrganization({
      databaseClient,
      organizationsRepository,
      organizationId,
      organizationName,
      userId: user.id,
    });

    const project = await upsertProject({
      databaseClient,
      projectId: DEMO_PROJECT_ID,
      organizationId: organization.id,
      createdByUserId: user.id,
      name: DEMO_PROJECT_NAME,
    });

    await projectsRepository.addProjectMember({
      projectId: project.id,
      userId: user.id,
      role: "owner",
    });

    const seededContacts = await Promise.all(
      DEMO_CONTACTS.map((contact) =>
        upsertContact({
          databaseClient,
          organizationId: organization.id,
          contact,
        }),
      ),
    );

    const seededEquipment = await Promise.all(
      DEMO_EQUIPMENT.map((equipmentItem) =>
        upsertEquipmentItem({
          databaseClient,
          organizationId: organization.id,
          equipmentItem,
        }),
      ),
    );

    const crewAssignments = await Promise.all([
      ensureProjectContactMember({
        crewRepository,
        projectId: project.id,
        contactId: DEMO_CONTACTS[0].id,
        accessRole: "admin",
        projectRole: "producer",
      }),
      ensureProjectContactMember({
        crewRepository,
        projectId: project.id,
        contactId: DEMO_CONTACTS[1].id,
        accessRole: "member",
        projectRole: "director of photography",
      }),
      ensureProjectContactMember({
        crewRepository,
        projectId: project.id,
        contactId: DEMO_CONTACTS[2].id,
        accessRole: "member",
        projectRole: "lighting vendor",
      }),
    ]);

    const seededShootingDays = await Promise.all(
      DEMO_SHOOTING_DAYS.map((shootingDay) =>
        upsertShootingDay({
          databaseClient,
          projectId: project.id,
          organizationId: organization.id,
          shootingDay,
        }),
      ),
    );

    await ensureAssignment({
      schedulingRepository,
      shootingDayId: DEMO_SHOOTING_DAYS[0].id,
      projectId: project.id,
      organizationId: organization.id,
      type: "crew",
      referenceId: crewAssignments[1].id,
      label: "DoP",
      callTime: "07:30",
    });
    await ensureAssignment({
      schedulingRepository,
      shootingDayId: DEMO_SHOOTING_DAYS[1].id,
      projectId: project.id,
      organizationId: organization.id,
      type: "crew",
      referenceId: crewAssignments[1].id,
      label: "DoP",
      callTime: "13:00",
    });
    await ensureAssignment({
      schedulingRepository,
      shootingDayId: DEMO_SHOOTING_DAYS[0].id,
      projectId: project.id,
      organizationId: organization.id,
      type: "equipment",
      referenceId: seededEquipment[0].id,
      label: "A-Cam package",
      callTime: null,
    });
    await ensureAssignment({
      schedulingRepository,
      shootingDayId: DEMO_SHOOTING_DAYS[1].id,
      projectId: project.id,
      organizationId: organization.id,
      type: "equipment",
      referenceId: seededEquipment[0].id,
      label: "A-Cam package",
      callTime: null,
    });

    await Promise.all(
      DEMO_NOTIFICATIONS.map((notification) =>
        upsertNotification({
          databaseClient,
          notification,
          userId: user.id,
          organizationId: organization.id,
          projectId: project.id,
        }),
      ),
    );

    const unreadNotificationCount = await notificationsRepository.countUnreadNotificationsByUser(
      user.id,
    );

    console.log(
      JSON.stringify(
        {
          userId: user.id,
          userEmail: user.email,
          userPassword,
          organizationId: organization.id,
          organizationName: organization.name,
          projectId: project.id,
          projectName: project.name,
          contacts: seededContacts.map((contact) => ({
            id: contact.id,
            name: contact.name,
          })),
          equipmentItems: seededEquipment.map((equipmentItem) => ({
            id: equipmentItem.id,
            name: equipmentItem.name,
          })),
          shootingDays: seededShootingDays.map((shootingDay) => ({
            id: shootingDay.id,
            title: shootingDay.title,
          })),
          unreadNotificationCount,
          sampleUploadAssetPath: DEMO_UPLOAD_ASSET_PATH,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(getDatabaseErrorMessage(error));
    process.exitCode = 1;
  } finally {
    await databaseClient.close();
  }
}

async function upsertOrganization(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  organizationsRepository: DrizzleOrganizationsRepository;
  organizationId: string;
  organizationName: string;
  userId: string;
}) {
  const existingOrganization = await params.organizationsRepository.findOrganizationById(
    params.organizationId,
  );
  const [organization] =
    existingOrganization
      ? [existingOrganization]
      : await params.databaseClient.db
          .insert(organizations)
          .values({
            id: params.organizationId,
            name: params.organizationName,
          })
          .returning();

  const existingMembership = await params.databaseClient.db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organization.id),
      eq(organizationMembers.userId, params.userId),
    ),
  });

  if (!existingMembership) {
    await params.organizationsRepository.addOrganizationMember({
      organizationId: organization.id,
      userId: params.userId,
      role: "owner",
    });
  }

  return organization;
}

async function upsertProject(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  projectId: string;
  organizationId: string;
  createdByUserId: string;
  name: string;
}) {
  const [project] = await params.databaseClient.db
    .insert(projects)
    .values({
      id: params.projectId,
      organizationId: params.organizationId,
      name: params.name,
      description: "Seeded workspace for closed-alpha smoke tests and demo walkthroughs.",
      status: "active",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      createdByUserId: params.createdByUserId,
    })
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        name: params.name,
        description: "Seeded workspace for closed-alpha smoke tests and demo walkthroughs.",
        status: "active",
        startDate: "2026-05-04",
        endDate: "2026-05-10",
        updatedAt: new Date(),
      },
    })
    .returning();

  return project;
}

async function upsertContact(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  organizationId: string;
  contact: (typeof DEMO_CONTACTS)[number];
}) {
  const [contact] = await params.databaseClient.db
    .insert(contacts)
    .values({
      id: params.contact.id,
      organizationId: params.organizationId,
      name: params.contact.name,
      email: params.contact.email,
      phone: params.contact.phone,
      company: params.contact.company,
      tags: params.contact.tags,
      type: params.contact.type,
    })
    .onConflictDoUpdate({
      target: contacts.id,
      set: {
        name: params.contact.name,
        email: params.contact.email,
        phone: params.contact.phone,
        company: params.contact.company,
        tags: params.contact.tags,
        type: params.contact.type,
        updatedAt: new Date(),
      },
    })
    .returning();

  return contact;
}

async function upsertEquipmentItem(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  organizationId: string;
  equipmentItem: (typeof DEMO_EQUIPMENT)[number];
}) {
  const [equipmentItem] = await params.databaseClient.db
    .insert(equipmentItems)
    .values({
      id: params.equipmentItem.id,
      organizationId: params.organizationId,
      name: params.equipmentItem.name,
      category: params.equipmentItem.category,
      status: params.equipmentItem.status,
      serialNumber: params.equipmentItem.serialNumber,
      description: params.equipmentItem.description,
      notes: params.equipmentItem.notes,
      archivedAt: null,
    })
    .onConflictDoUpdate({
      target: equipmentItems.id,
      set: {
        name: params.equipmentItem.name,
        category: params.equipmentItem.category,
        status: params.equipmentItem.status,
        serialNumber: params.equipmentItem.serialNumber,
        description: params.equipmentItem.description,
        notes: params.equipmentItem.notes,
        archivedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return equipmentItem;
}

async function ensureProjectContactMember(params: {
  crewRepository: DrizzleCrewRepository;
  projectId: string;
  contactId: string;
  accessRole: "owner" | "admin" | "member";
  projectRole: string;
}) {
  const existingMember = await params.crewRepository.findCrewMemberByContactId(
    params.projectId,
    params.contactId,
  );

  if (existingMember) {
    await params.crewRepository.updateCrewMember(existingMember.id, {
      accessRole: params.accessRole,
      projectRole: params.projectRole,
    });

    return (
      (await params.crewRepository.findCrewMemberByContactId(params.projectId, params.contactId)) ??
      existingMember
    );
  }

  return params.crewRepository.createCrewMember({
    projectId: params.projectId,
    userId: null,
    contactId: params.contactId,
    accessRole: params.accessRole,
    projectRole: params.projectRole,
  });
}

async function upsertShootingDay(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  projectId: string;
  organizationId: string;
  shootingDay: (typeof DEMO_SHOOTING_DAYS)[number];
}) {
  const [shootingDay] = await params.databaseClient.db
    .insert(shootingDays)
    .values({
      id: params.shootingDay.id,
      projectId: params.projectId,
      organizationId: params.organizationId,
      title: params.shootingDay.title,
      date: params.shootingDay.date,
      location: params.shootingDay.location,
      startTime: params.shootingDay.startTime,
      endTime: params.shootingDay.endTime,
      notes: params.shootingDay.notes,
      status: params.shootingDay.status,
    })
    .onConflictDoUpdate({
      target: shootingDays.id,
      set: {
        title: params.shootingDay.title,
        date: params.shootingDay.date,
        location: params.shootingDay.location,
        startTime: params.shootingDay.startTime,
        endTime: params.shootingDay.endTime,
        notes: params.shootingDay.notes,
        status: params.shootingDay.status,
        updatedAt: new Date(),
      },
    })
    .returning();

  return shootingDay;
}

async function ensureAssignment(params: {
  schedulingRepository: DrizzleSchedulingRepository;
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  type: "crew" | "equipment";
  referenceId: string;
  label: string | null;
  callTime: string | null;
}) {
  const existingAssignment = await params.schedulingRepository.findAssignmentByReference({
    shootingDayId: params.shootingDayId,
    type: params.type,
    referenceId: params.referenceId,
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  return params.schedulingRepository.createShootingDayAssignment({
    shootingDayId: params.shootingDayId,
    projectId: params.projectId,
    organizationId: params.organizationId,
    type: params.type,
    referenceId: params.referenceId,
    label: params.label,
    callTime: params.callTime,
  });
}

async function upsertNotification(params: {
  databaseClient: ReturnType<typeof createDatabaseClient>;
  notification: (typeof DEMO_NOTIFICATIONS)[number];
  userId: string;
  organizationId: string;
  projectId: string;
}) {
  await params.databaseClient.db
    .insert(notifications)
    .values({
      id: params.notification.id,
      userId: params.userId,
      organizationId: params.organizationId,
      projectId: params.projectId,
      type: params.notification.type,
      severity: params.notification.severity,
      title: params.notification.title,
      message: params.notification.message,
      linkPath: getDemoNotificationLinkPath(
        params.organizationId,
        params.projectId,
        params.notification.relatedEntityType,
        params.notification.relatedEntityId,
      ),
      relatedEntityType: params.notification.relatedEntityType,
      relatedEntityId: params.notification.relatedEntityId,
      isRead: false,
    })
    .onConflictDoUpdate({
      target: notifications.id,
      set: {
        type: params.notification.type,
        severity: params.notification.severity,
        title: params.notification.title,
        message: params.notification.message,
        linkPath: getDemoNotificationLinkPath(
          params.organizationId,
          params.projectId,
          params.notification.relatedEntityType,
          params.notification.relatedEntityId,
        ),
        relatedEntityType: params.notification.relatedEntityType,
        relatedEntityId: params.notification.relatedEntityId,
        isRead: false,
      },
    });
}

function getDemoNotificationLinkPath(
  organizationId: string,
  projectId: string,
  relatedEntityType: (typeof DEMO_NOTIFICATIONS)[number]["relatedEntityType"],
  relatedEntityId: string,
) {
  if (relatedEntityType === "shooting_day") {
    return `/organizations/${organizationId}/projects/${projectId}/shooting-days/${relatedEntityId}`;
  }

  return `/organizations/${organizationId}/projects/${projectId}`;
}

void main();
