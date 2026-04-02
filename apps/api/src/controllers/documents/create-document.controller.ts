import type { NextFunction, Request, Response } from "express";

import type { CrewRepository } from "@film-set-app/domain-crew";
import {
  createDocument,
  type DocumentsRepository,
  type DocumentsStorage,
} from "@film-set-app/domain-documents";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentDocument } from "../../presenters/document.presenter.js";

interface CreateDocumentControllerParams {
  crewRepository: CrewRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

interface UploadedFileRequest extends Request {
  file?: Express.Multer.File;
}

export function createCreateDocumentController(params: CreateDocumentControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const projectId = typeof request.params.projectId === "string" ? request.params.projectId : "";
      const uploadedFile = (request as UploadedFileRequest).file;
      const result = await createDocument({
        projectId,
        input: request.body,
        file: uploadedFile
          ? {
              originalName: uploadedFile.originalname,
              mimeType: uploadedFile.mimetype,
              size: uploadedFile.size,
              buffer: uploadedFile.buffer,
            }
          : null,
        sessionUser: (request as AuthenticatedRequest).sessionUser,
        crewRepository: params.crewRepository,
        notificationsRepository: params.notificationsRepository,
        projectsRepository: params.projectsRepository,
        documentsRepository: params.documentsRepository,
        documentsStorage: params.documentsStorage,
      });

      response.status(201).json(presentDocument(result));
    } catch (error) {
      next(error);
    }
  };
}
