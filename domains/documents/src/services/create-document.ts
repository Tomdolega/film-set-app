import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentsStorage } from "../documents.storage.js";
import type { DocumentWithMembership, UploadedDocumentFile } from "../model/document.js";
import { canManageDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";
import { parseCreateDocumentInput } from "../schemas/document-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateDocumentParams {
  projectId: string;
  input: unknown;
  file: UploadedDocumentFile | null | undefined;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export async function createDocument(params: CreateDocumentParams): Promise<DocumentWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  if (!params.file) {
    const error: StatusError = new Error("file is required");
    error.statusCode = 400;
    throw error;
  }

  const project = await params.projectsRepository.findProjectById(params.projectId);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const input = parseCreateDocumentInput(params.input);
  const storedFile = await params.documentsStorage.saveFile({
    projectId: params.projectId,
    file: params.file,
  });

  try {
    const document = await params.documentsRepository.createDocument({
      organizationId: project.organizationId,
      projectId: project.id,
      name: input.name ?? params.file.originalName,
      type: input.type,
      description: input.description,
      storageKey: storedFile.storageKey,
      mimeType: params.file.mimeType,
      fileSize: params.file.size,
      uploadedByUserId: sessionUser.id,
    });

    return {
      document,
      currentUserRole: membership.role,
    };
  } catch (error) {
    await params.documentsStorage.deleteFile(storedFile.storageKey);
    throw error;
  }
}
