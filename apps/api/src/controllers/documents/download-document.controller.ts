import type { NextFunction, Request, Response } from "express";

import {
  getDocumentDownload,
  type DocumentsRepository,
  type DocumentsStorage,
} from "@film-set-app/domain-documents";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

interface DownloadDocumentControllerParams {
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export function createDownloadDocumentController(params: DownloadDocumentControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const documentId =
        typeof request.params.documentId === "string" ? request.params.documentId : "";

      const result = await getDocumentDownload({
        documentId,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        projectsRepository: params.projectsRepository,
        documentsRepository: params.documentsRepository,
        documentsStorage: params.documentsStorage,
      });

      response.redirect(302, result.downloadUrl);
    } catch (error) {
      next(error);
    }
  };
}
