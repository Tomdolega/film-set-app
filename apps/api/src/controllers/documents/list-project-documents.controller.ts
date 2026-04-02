import type { NextFunction, Request, Response } from "express";

import { listProjectDocuments, type DocumentsRepository } from "@film-set-app/domain-documents";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentDocumentRecord } from "../../presenters/document.presenter.js";

interface ListProjectDocumentsControllerParams {
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
}

export function createListProjectDocumentsController(
  params: ListProjectDocumentsControllerParams,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId = typeof request.params.projectId === "string" ? request.params.projectId : "";
      const result = await listProjectDocuments({
        projectId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        documentsRepository: params.documentsRepository,
      });

      response
        .status(200)
        .json(result.documents.map((document) => presentDocumentRecord(document, result.currentUserRole)));
    } catch (error) {
      next(error);
    }
  };
}
