import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentsListResult } from "../model/document.js";
import { canReadDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface ListProjectDocumentsParams {
  projectId: string;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
}

export async function listProjectDocuments(
  params: ListProjectDocumentsParams,
): Promise<DocumentsListResult> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canReadDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const documents = await params.documentsRepository.listDocumentsByProject(params.projectId);

  return {
    documents,
    currentUserRole: membership.role,
  };
}
