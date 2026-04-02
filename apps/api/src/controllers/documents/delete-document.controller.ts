import type { NextFunction, Request, Response } from "express";

import {
  deleteDocument,
  type DocumentsRepository,
  type DocumentsStorage,
} from "@film-set-app/domain-documents";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

interface DeleteDocumentControllerParams {
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export function createDeleteDocumentController(params: DeleteDocumentControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const documentId =
        typeof request.params.documentId === "string" ? request.params.documentId : "";

      await deleteDocument({
        documentId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        documentsRepository: params.documentsRepository,
        documentsStorage: params.documentsStorage,
      });

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
