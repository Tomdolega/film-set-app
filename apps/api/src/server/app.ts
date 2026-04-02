import express from "express";

import type { ContactsRepository } from "@film-set-app/domain-contacts";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { DocumentsRepository, DocumentsStorage } from "@film-set-app/domain-documents";
import type { EquipmentRepository } from "@film-set-app/domain-equipment";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";
import type { DatabaseClient, DrizzleUsersRepository } from "@film-set-app/infra-database";

import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import { createErrorHandler } from "../middleware/error-handler.middleware.js";
import { createContactsRouter } from "../routes/contacts.routes.js";
import { createDocumentsRouter } from "../routes/documents.routes.js";
import { createEquipmentRouter } from "../routes/equipment.routes.js";
import { createHealthRouter } from "../routes/health.routes.js";
import { createNotificationsRouter } from "../routes/notifications.routes.js";
import { createOrganizationsRouter } from "../routes/organizations.routes.js";
import { createProjectsRouter } from "../routes/projects.routes.js";
import { createShootingDaysRouter } from "../routes/shooting-days.routes.js";

export interface CreateAppParams {
  databaseClient: DatabaseClient;
  usersRepository: DrizzleUsersRepository;
  organizationsRepository: OrganizationsRepository;
  projectsRepository: ProjectsRepository;
  contactsRepository: ContactsRepository;
  crewRepository: CrewRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
  equipmentRepository: EquipmentRepository;
  notificationsRepository: NotificationsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createApp(params: CreateAppParams) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.use(createHealthRouter({ databaseClient: params.databaseClient }));
  app.use(createAuthMiddleware({ usersRepository: params.usersRepository }));
  app.use("/organizations", createOrganizationsRouter(params));
  app.use("/contacts", createContactsRouter(params));
  app.use("/equipment", createEquipmentRouter(params));
  app.use("/projects", createProjectsRouter(params));
  app.use("/documents", createDocumentsRouter(params));
  app.use("/shooting-days", createShootingDaysRouter(params));
  app.use("/notifications", createNotificationsRouter(params));
  app.use(createErrorHandler());

  return app;
}
