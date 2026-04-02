import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentWithMembership } from "../model/document.js";
import { canManageDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";
import { parseUpdateDocumentInput } from "../schemas/document-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UpdateDocumentParams {
  documentId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
}

export async function updateDocument(params: UpdateDocumentParams): Promise<DocumentWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const existingDocument = await params.documentsRepository.findDocumentById(params.documentId);

  if (!existingDocument) {
    const error: StatusError = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await assertProjectAccess({
    projectId: existingDocument.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const input = parseUpdateDocumentInput(params.input);
  const document = await params.documentsRepository.updateDocument(params.documentId, input);

  if (!document) {
    const error: StatusError = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    document,
    currentUserRole: membership.role,
  };
}
