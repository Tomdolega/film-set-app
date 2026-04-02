import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentWithMembership } from "../model/document.js";
import { canReadDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface GetDocumentParams {
  documentId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
}

export async function getDocument(params: GetDocumentParams): Promise<DocumentWithMembership> {
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

  if (!canReadDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  return {
    document,
    currentUserRole: membership.role,
  };
}
