import { Router } from "express";

import type { DocumentsRepository, DocumentsStorage } from "@film-set-app/domain-documents";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import { createDeleteDocumentController } from "../controllers/documents/delete-document.controller.js";
import { createGetDocumentController } from "../controllers/documents/get-document.controller.js";
import { createUpdateDocumentController } from "../controllers/documents/update-document.controller.js";

interface CreateDocumentsRouterParams {
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export function createDocumentsRouter(params: CreateDocumentsRouterParams) {
  const router = Router();

  router.get("/:documentId", createGetDocumentController(params));
  router.patch("/:documentId", createUpdateDocumentController(params));
  router.delete("/:documentId", createDeleteDocumentController(params));

  return router;
}
