import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentsStorage } from "../documents.storage.js";
import { canManageDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface DeleteDocumentParams {
  documentId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export async function deleteDocument(params: DeleteDocumentParams): Promise<void> {
  const sessionUser = getSessionUser(params.sessionUser);
  const document = await params.documentsRepository.findDocumentById(params.documentId);

  if (!document) {
    const error: StatusError = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertProjectAccess({
    projectId: document.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  await params.documentsStorage.deleteFile(document.storageKey);
  await params.documentsRepository.deleteDocument(document.id);
}
