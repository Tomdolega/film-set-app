import type { NextFunction, Request, Response } from "express";

import { updateDocument, type DocumentsRepository } from "@film-set-app/domain-documents";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentDocument } from "../../presenters/document.presenter.js";

interface UpdateDocumentControllerParams {
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
}

export function createUpdateDocumentController(params: UpdateDocumentControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const documentId =
        typeof request.params.documentId === "string" ? request.params.documentId : "";

      const result = await updateDocument({
        documentId,
        input: request.body,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        documentsRepository: params.documentsRepository,
      });

      response.status(200).json(presentDocument(result));
    } catch (error) {
      next(error);
    }
  };
}
