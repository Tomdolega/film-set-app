import { Router } from "express";
import multer from "multer";

import type { CrewRepository, UserLookupRepository } from "@film-set-app/domain-crew";
import type { ContactsRepository } from "@film-set-app/domain-contacts";
import type { DocumentsRepository, DocumentsStorage } from "@film-set-app/domain-documents";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { OrganizationsRepository } from "@film-set-app/domain-organizations";
import type { ProjectsRepository } from "@film-set-app/domain-projects";
import type { SchedulingRepository } from "@film-set-app/domain-scheduling";

import { createAddProjectMemberController } from "../controllers/crew/add-project-member.controller.js";
import { createListProjectCrewController } from "../controllers/crew/list-project-crew.controller.js";
import { createRemoveProjectMemberController } from "../controllers/crew/remove-project-member.controller.js";
import { createUpdateProjectMemberController } from "../controllers/crew/update-project-member.controller.js";
import { createCreateDocumentController } from "../controllers/documents/create-document.controller.js";
import { createListProjectDocumentsController } from "../controllers/documents/list-project-documents.controller.js";
import { createCreateProjectController } from "../controllers/projects/create-project.controller.js";
import { createGetProjectController } from "../controllers/projects/get-project.controller.js";
import { createListProjectsController } from "../controllers/projects/list-projects.controller.js";
import { createUpdateProjectController } from "../controllers/projects/update-project.controller.js";
import { createCreateShootingDayController } from "../controllers/scheduling/create-shooting-day.controller.js";
import { createListShootingDaysController } from "../controllers/scheduling/list-shooting-days.controller.js";
import { getDocumentUploadMaxBytes } from "../lib/runtime-config.js";

interface CreateProjectsRouterParams {
  usersRepository: UserLookupRepository;
  organizationsRepository: OrganizationsRepository;
  projectsRepository: ProjectsRepository;
  contactsRepository: ContactsRepository;
  crewRepository: CrewRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
  notificationsRepository: NotificationsRepository;
  schedulingRepository: SchedulingRepository;
}

export function createProjectsRouter(params: CreateProjectsRouterParams) {
  const router = Router();
  const documentUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: getDocumentUploadMaxBytes(),
    },
  });

  router.post("/", createCreateProjectController(params));
  router.get("/", createListProjectsController(params));
  router.get("/:projectId", createGetProjectController(params));
  router.patch("/:projectId", createUpdateProjectController(params));
  router.post("/:projectId/shooting-days", createCreateShootingDayController(params));
  router.get("/:projectId/shooting-days", createListShootingDaysController(params));
  router.post(
    "/:projectId/documents",
    documentUpload.single("file"),
    createCreateDocumentController(params),
  );
  router.get("/:projectId/documents", createListProjectDocumentsController(params));
  router.post("/:projectId/crew", createAddProjectMemberController(params));
  router.get("/:projectId/crew", createListProjectCrewController(params));
  router.patch("/:projectId/crew/:projectMemberId", createUpdateProjectMemberController(params));
  router.delete("/:projectId/crew/:projectMemberId", createRemoveProjectMemberController(params));

  return router;
}
